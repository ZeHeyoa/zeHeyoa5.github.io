	
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
	 * Sphere definition
	 */
	// (x,y,z)=centre, r=radius
	function sphere(x,y,z,r, cr,cg,cb, d,p,pp,rf) {
		sp[numsp] = new Object();
		var s = sp[numsp];
		s.x =x;  s.y =y;  s.z =z;   s.r=r;
		s.cr=cr; s.cg=cg; s.cb=cb;
		s.d =d;  s.p =p;  s.pp=pp;	s.rf=rf;

		s.precalc = function() {
			this.ir = 1/this.r;
			this.c = this.x*this.x + this.y*this.y + this.z*this.z - this.r*this.r;
		};
		s.sethalf = function(nx,ny,nz, cr,cg,cb, d,p,pp,rf) {
			// Set hemisphere, normal points in direction of open half.
			// Inside has different material properties.
			this.nx=nx;	this.ny=ny;	this.nz=nz;
			this.inside = {
				x:this.x,	y:this.y,	z:this.z,	r:this.r,
				nx:nx, ny:ny, nz:nz,
				obj:this.obj+'inside', parent:this,
				cr:cr, cg:cg, cb:cb, d:d, p:p, pp:pp, rf:rf,
				precalc:this.precalc, setuv:this.setuv, getuv:this.getuv,
				setbitmap:this.setbitmap, texture:function(){} };
			return this.inside;
		}
		s.setuv = function(ux,uy,uz, vx,vy,vz, uo,vo, texturefunc) {
			var l,v,wx,wy,wz;
			this.ocr=this.cr;	this.ocg=this.cg;	this.ocb=this.cb;
			this.ul = l = Math.sqrt(ux*ux+uy*uy+uz*uz);	ux/=l;	uy/=l;	uz/=l;
			this.vl = l = Math.sqrt(vx*vx+vy*vy+vz*vz);	vx/=l;	vy/=l;	vz/=l;
			
/*			if (this.nx!=undefined) {
				// if half-sphere, then attempt to align uv axes with the axis (nx,ny,nz)
				v = vx*this.nx + vy*this.ny + vz*this.nz;
				wx=uy*vz-uz*vy;	wy=uz*vx-ux*vz;	wz=ux*vy-uy*vx;
				vx = this.nx*v;			vy = this.ny*v;			vz = this.nz*v;
				ux = vy*wz-vz*wy;		uy = vz*wx-vx*wz;		uz = vx*wy-vy*wx;
				alert(hun(ux)+","+hun(uy)+","+hun(uz)+" || "+hun(vx)+","+hun(vy)+","+hun(vz));
			}*/
			this.wx=uy*vz-uz*vy;	this.wy=uz*vx-ux*vz;	this.wz=ux*vy-uy*vx;
			
			this.ux=ux;	this.uy=uy;	this.uz=uz;	this.vx=vx;	this.vy=vy;	this.vz=vz;
			this.uo=uo;	this.vo=vo;	this.texture = texturefunc;
			return this;
		}
		s.setbitmap = function(imgurl) { setbitmap(this, imgurl); return this; }
		s.texture = function(){};

		s.hit = sp_hit;
		s.intersect = sp_intersect;
		s.li_intersect = sp_li_intersect;
		s.getuv = function() {
			var x,y,z,u,v,r;
			x = ix-this.x;	y = iy-this.y;	z = iz-this.z;
			v = Math.acos(-(x*this.vx+y*this.vy+z*this.vz)*this.ir);
			u = (x*this.ux+y*this.uy+z*this.uz)/(this.r*Math.sin(v));
			this.u = this.uo + Math.acos(u)/6.2831853072;
			this.v = this.vo + v/3.1415926536;
			if ((x*this.wx+y*this.wy+z*this.wz)<0) this.u=1-this.u;
			this.u *= this.ul;
			this.v *= this.vl;
		}
		
		s.precalc();
		s.obj = numob;
		ob[numob++] = s;
		numsp++;
		return s;
	}

		// Sphere intersect
		function sp_intersect() {
			var self, b,b2,c,d, t;
			self=(this.obj==iobj);
			// Convex object can't reflect itself on the outside
			if (self && (this.nx==undefined || ndir>0)) return;
			
			b = this.x*r.dx + this.y*r.dy + this.z*r.dz - r.odotd;
			b2= b*b;
			c = r.odoto - 2*(this.x*r.ox + this.y*r.oy + this.z*r.oz) + this.c;
			d = b2 - r.ddotd*c;
			if (d<0) return;
			if (this.nx==undefined) {		// Closed sphere
				if (b<0) {
					if (b2>d) return;		// both roots <0
					t=(b+Math.sqrt(d))/r.ddotd;
				} else {
					if (b2>d) t=(b-Math.sqrt(d))/r.ddotd; else t=(b+Math.sqrt(d))/r.ddotd;
				}
				if (t>0 && t<mt) { mt=t; mo=this.obj; mndir=1; }
				return;
			}
			// Open sphere
			d = Math.sqrt(d);
			// Try near first if not testing self
			if (!self) {
				t = (b-d)/r.ddotd;
				if (t>0 && t<mt) {
					if (((r.ox+r.dx*t-this.x)*this.nx + (r.oy+r.dy*t-this.y)*this.ny + (r.oz+r.dz*t-this.z)*this.nz)<=0) {
						mt=t; mo=this.obj; mndir=(b>0)?1:-1;
						return;
					}
				}
			}
			// Now try far
			t = (b+d)/r.ddotd;
			if (t<=0 || t>mt) return;
			if (((r.ox+r.dx*t-this.x)*this.nx + (r.oy+r.dy*t-this.y)*this.ny + (r.oz+r.dz*t-this.z)*this.nz)>0) return;
			mt=t; mo=this.obj; mndir=-1;
		}

		// find incident and normal based on previous sphere intersection
		function sp_hit() {
			// incident point
			ix = r.ox + r.dx*mt;
			iy = r.oy + r.dy*mt;
			iz = r.oz + r.dz*mt;
			// normal
			nx = ndir*(ix - this.x)*this.ir;
			ny = ndir*(iy - this.y)*this.ir;
			nz = ndir*(iz - this.z)*this.ir;
		}

		// Test if ray from incident to light intersects this sphere
		function sp_li_intersect() {
			var self,t, b,b2,c,d;
			self=(this.obj==iobj);
			// Convex object can't shadow itself on the outside
			if (self && (this.nx==undefined || ndir>=0)) return false;
			
			b = this.x*lx + this.y*ly + this.z*lz - idotl;	b2 = b*b;
			c = idoti - 2*(this.x*ix + this.y*iy + this.z*iz) + this.c;
			d = b2 - ldotl*c;
			if (d<0) return false;
			if (this.nx==undefined) {			// Closed sphere
				if (b<0) {
					if (b2>d) return;			// both roots <0
					t = (b+Math.sqrt(d)) / ldotl;
				} else {
					if (b2>d) t = (b-Math.sqrt(d)) / ldotl;
						else t = (b+Math.sqrt(d)) / ldotl;
				}
				return (t>=0 && t<=1);
			}
			// Open sphere
			d = Math.sqrt(d);
			t = (b+d) / ldotl;
			if (t>=0 && t<=1) {
				c = (ix+lx*t-this.x)*this.nx + (iy+ly*t-this.y)*this.ny + (iz+lz*t-this.z)*this.nz;
				if (c<=0) return true;
			}
			if (self) return false;
			t = (b-d) / ldotl;
			if (t<0 || t>1) return false;
			c = (ix+lx*t-this.x)*this.nx + (iy+ly*t-this.y)*this.ny + (iz+lz*t-this.z)*this.nz;
			return (c<=0);
		}
	