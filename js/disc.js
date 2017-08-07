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
	 * Disc defintion
	 */
	// (x,y,z)=centre, (nx,ny,nz)=normal
	function disc(x,y,z, nx,ny,nz, r, cr,cg,cb, d,ph,pp,rf) {
		pl[numpl] = new Object();
		var p = pl[numpl];
		
		p.x =x;		p.y =y;		p.z =z;
		p.cr=cr;	p.cg=cg;	p.cb=cb;	p.d=d;
		p.p=ph;		p.pp=pp;	p.rf=rf;
		l = Math.sqrt(nx*nx + ny*ny + nz*nz);
		p.nx=nx/l;	p.ny=ny/l;	p.nz=nz/l;

		p.precalc = function() {
			this.r2=r*r;
			this.D = this.nx*this.x + this.ny*this.y + this.nz*this.z;
			this.ul2 = this.ux*this.ux + this.uy*this.uy + this.uz*this.uz;
			this.vl2 = this.vx*this.vx + this.vy*this.vy + this.vz*this.vz;
		};
		p.setuv = function(ux,uy,uz, vx,vy,vz, uo,vo, texturefunc) {
			this.ocr=this.cr;	this.ocg=this.cg;	this.ocb=this.cb;
			this.ux=ux;	this.uy=uy;	this.uz=uz;	this.vx=vx;	this.vy=vy;	this.vz=vz;
			this.uo=uo;	this.vo=vo;	this.texture = texturefunc;
			return this;
		}
		p.setbitmap = function(imgurl) { setbitmap(this, imgurl); return this; }
		p.texture = function(){};

		p.hit = di_hit;
		p.intersect = di_intersect;
		p.li_intersect = di_li_intersect;
		p.getuv = function() {
			var dx,dy,dz;
			dx= ix-this.x;	dy= iy-this.y;	dz= iz-this.z;
			this.u = this.uo + (dx*this.ux + dy*this.uy + dz*this.uz)/this.ul2;
			this.u = this.uo + (dx*this.ux + dy*this.uy + dz*this.uz)/this.ul2;
			this.v = 1 - this.vo - (dx*this.vx + dy*this.vy + dz*this.vz)/this.vl2;
		}
		
		p.precalc();
		p.obj = numob;
		ob[numob++] = p;
		numpl++;
		return p;
	}
	
		function di_intersect() {
			var t,cix,ciy,ciz;
			if (this.obj==iobj) return;
			t = (this.D - this.nx*r.ox - this.ny*r.oy - this.nz*r.oz) /
				(this.nx*r.dx + this.ny*r.dy + this.nz*r.dz);
			if (t<=0 || t>=mt) return;
			cix = r.ox + t*r.dx - this.x;
			ciy = r.oy + t*r.dy - this.y;
			ciz = r.oz + t*r.dz - this.z;
			if ((cix*cix+ciy*ciy+ciz*ciz) > this.r2) return;
			mt=t; mo=this.obj;	mndir=1;
		}
		
		function di_hit() {
			// incident point
			ix = r.ox + r.dx*mt;
			iy = r.oy + r.dy*mt;
			iz = r.oz + r.dz*mt;
			// normal
			nx = this.nx;
			ny = this.ny;
			nz = this.nz;
		}
		
		function di_li_intersect() {
			if (this.obj==iobj) return false;
			var t,x,y,z;
			t = (this.D - this.nx*ix - this.ny*iy - this.nz*iz) / (this.nx*lx + this.ny*ly + this.nz*lz);
			if (t<=0 || t>=1) return false;

			x = ix + t*lx - this.x;
			y = iy + t*ly - this.y;
			z = iz + t*lz - this.z;
			return ((x*x+y*y+z*z)<=this.r2);
		}
	