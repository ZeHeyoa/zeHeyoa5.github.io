/***********************************
 * Scene primitives
 *
 * All primitives have common material properties:
 *	(cr,cg,cb) = colour
 *	d = diffuse weight (0..1)
 *	p = phong weight (0..1)
 *	pp = phong power coefficient (higher = more acute specular)
 *	rf = reflectivity (0..1)
 */

	/*************************************
	 * Cylinder definition (not infinite)
	 */
	// (x,y,z)=base, (x1,y1,z1)=end, r=radius
	function cylinder(x,y,z, x1,y1,z1, r, cr,cg,cb, d,p,pp,rf) {
		var c = cy[numcy] = new Object();
		c.x =x;  c.y =y;  c.z =z;   c.r=r;
		c.x1=x1; c.y1=y1; c.z1=z1;
		c.cr=cr; c.cg=cg; c.cb=cb;
		c.d =d;  c.p =p;  c.pp=pp;	c.rf=rf;

		c.precalc = function() {
			this.r2 = this.r*this.r;
			this.ir = 1/this.r;
			this.ir2 = 1/this.r2;
			// we don't normalise, because we're using the normal as the axis & length
			this.nx	= this.x1 - this.x;
			this.ny = this.y1 - this.y;
			this.nz = this.z1 - this.z;
			this.len2= this.nx*this.nx + this.ny*this.ny + this.nz*this.nz;
			this.ilen2=1/this.len2;
			this.c = this.len2 * this.r2;
			this.len= Math.sqrt(this.len2);
		};
		c.setinside = function(cr,cg,cb, d,p,pp,rf) {
			// Inside can have different material properties
			this.inside = {
				x:this.x, y:this.y, z:this.z,	x1:this.x1, y1:this.y1, z1:this.z1,
				r:this.r, cr:cr, cg:cg, cb:cb, d:d, p:p, pp:pp, rf:rf,
				obj:this.obj+'inside', parent:this, precalc:this.precalc, texture:function(){},
				setbitmap:this.setbitmap, setuv:this.setuv,	getuv:this.getuv};
			return this.inside;
		}
		c.setuv = function(ux,uy,uz, vx,vy,vz, uo,vo, texturefunc) {
			var l;
			this.ocr=this.cr;	this.ocg=this.cg;	this.ocb=this.cb;
			this.ul = l = Math.sqrt(ux*ux+uy*uy+uz*uz);	ux/=l;	uy/=l;	uz/=l;
			this.vl = l = Math.sqrt(vx*vx+vy*vy+vz*vz);	vx/=l;	vy/=l;	vz/=l;
			this.ux=ux;	this.uy=uy;	this.uz=uz;	this.vx=vx;	this.vy=vy;	this.vz=vz;
			this.wx=uy*vz-uz*vy;	this.wy=uz*vx-ux*vz;	this.wz=ux*vy-uy*vx;
			this.uo=uo;	this.vo=vo;	this.texture = texturefunc;
			return this;
		}
		c.setbitmap = function(imgurl) { setbitmap(this, imgurl); return this; }
		c.texture = function(){};

		c.hit = cy_hit;
		c.intersect = cy_intersect;
		c.li_intersect = cy_li_intersect;
		c.getuv = function() {
			var x,y,z,cx,cy,cz;
			cx=this.x+this.nx*icyl;	cy=this.y+this.ny*icyl;	cz=this.z+this.nz*icyl;
			x=ix-cx;	y=iy-cy;	z=iz-cz;
			this.u = Math.acos((x*this.ux+y*this.uy+z*this.uz)*this.ir)/6.2831853072;
			if ((x*this.wx+y*this.wy+z*this.wz)<0) this.u=1-this.u;
			this.u = (this.u+this.uo) * this.ul;
			this.v = (1-icyl-this.vo) * this.vl;
		}
		
		c.precalc();
		c.obj = numob;
		ob[numob++] = c;
		numcy++;
		return c;
	}
		
		function cy_intersect() {
			var self,t, a,b,b2,c,d, px,py,pz, onx,ony,onz, dnx,dny,dnz, cix,ciy,ciz;
			self=(this.obj==iobj);
			if (self && ndir>=0) return;	// Convex object can't reflect itself on the outside
			
			px  = this.x - r.ox;				py  = this.y - r.oy;				pz  = this.z - r.oz;
			onx = py*this.nz - pz*this.ny;		ony = pz*this.nx - px*this.nz;		onz = px*this.ny - py*this.nx;
			dnx = r.dy*this.nz - r.dz*this.ny;	dny = r.dz*this.nx - r.dx*this.nz;	dnz = r.dx*this.ny - r.dy*this.nx;
			a   = dnx*dnx + dny*dny + dnz*dnz;	b   = onx*dnx + ony*dny + onz*dnz;	b2  = b*b;
			d   = b2 - (onx*onx + ony*ony + onz*onz - this.c)*a;
			if (d<0) return;
			if (b<0 || self) {				// If testing self, test only for far intersect
				t = (b+Math.sqrt(d))/a;
				if (t<0 || t>mt) return;	// Intersection behind incident or beyond current nearest
				cix= r.ox + r.dx*t;	ciy = r.oy + r.dy*t;	ciz = r.oz + r.dz*t;
				px = cix - this.x;	py  = ciy - this.y;		pz  = ciz - this.z;
				c  = (px*this.nx + py*this.ny + pz*this.nz) * this.ilen2;
				if (c<0 || c>1) return;
				mndir = -1;
			} else {
				d = Math.sqrt(d);
				t = (b-d)/a;
				if (t>mt) return;
				if (t>=0) {	// Closer intersection
					cix= r.ox + r.dx*t;	ciy = r.oy + r.dy*t;	ciz = r.oz + r.dz*t;
					px = cix - this.x;	py  = ciy - this.y;		pz  = ciz - this.z;
					c  = (px*this.nx + py*this.ny + pz*this.nz) * this.ilen2;
					if (c>=0 && c<=1) mndir=1; else t=-1;
				}
				if (t<0) {
					t = (b+d)/a;
					if (t>mt) return;
					cix= r.ox + r.dx*t;	ciy = r.oy + r.dy*t;	ciz = r.oz + r.dz*t;
					px = cix - this.x;	py  = ciy - this.y;		pz  = ciz - this.z;
					c  = (px*this.nx + py*this.ny + pz*this.nz) * this.ilen2;
					if (c<0 || c>1) return;
					mndir =-1;
				}
			}

			ix=cix;	iy=ciy;	iz=ciz;
			icyl = c;		mt=t;
			mo=this.obj;	mndir *= this.ir;
		}
		
		function cy_hit() {
			nx = ndir * (ix - (this.x + this.nx*icyl));
			ny = ndir * (iy - (this.y + this.ny*icyl));
			nz = ndir * (iz - (this.z + this.nz*icyl));
		}
		
		function cy_li_intersect() {
			var t,self, px,py,pz, onx,ony,onz, dnx,dny,dnz, a,b,b2,c,d;
			self=(this.obj==iobj);
			if (self && ndir>=0) return false;	// Convex object can't shadow itself on the outside
			px  = this.x - ix;				py  = this.y - iy;				pz  = this.z - iz;
			onx = py*this.nz - pz*this.ny;	ony = pz*this.nx - px*this.nz;	onz = px*this.ny - py*this.nx;
			dnx = ly*this.nz - lz*this.ny;	dny = lz*this.nx - lx*this.nz;	dnz = lx*this.ny - ly*this.nx;
			a   = dnx*dnx+dny*dny+dnz*dnz;	b   = onx*dnx+ony*dny+onz*dnz;	b2  = b*b;
			d   = b2 - (onx*onx + ony*ony + onz*onz - this.c)*a;
			if (d<0) return false;
			if (b<0 || self) {					// If testing self, test only for far intersect
				t = (b+Math.sqrt(d)) / a;
				if (t<0 || t>1) return false;	// Intersection behind incident or beyond light
				cix = ix + lx*t;	ciy = iy + ly*t;	ciz = iz+lz*t;
				px  = cix - this.x;	py  = ciy - this.y;	pz  = ciz - this.z;
				c   = (px*this.nx + py*this.ny + pz*this.nz) * this.ilen2;
				return (c>=0 && c<=1);
			}
			d = Math.sqrt(d);
			t = (b-d)/a;
			if (t>1) return false;
			if (t>=0) {	// Closer intersection
				cix = ix + lx*t;	ciy = iy + ly*t;	ciz = iz+lz*t;
				px  = cix - this.x;	py  = ciy - this.y;	pz  = ciz - this.z;
				c   = (px*this.nx + py*this.ny + pz*this.nz) * this.ilen2;
				if (c>=0 && c<=1) return true;
			}
			t = (b+d)/a;
			if (t>1) return false;
			cix = ix + lx*t;	ciy = iy + ly*t;	ciz = iz+lz*t;
			px  = cix - this.x;	py  = ciy - this.y;	pz  = ciz - this.z;
			c   = (px*this.nx + py*this.ny + pz*this.nz) * this.ilen2;
			return (c>=0 && c<=1);
		}

		