	
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
	 * Infinite plane definition
	 */
	// (x0,y0,z0)-(x1,y1,z1)-(x2,y2,z2) = co-planar point (counter-clockwise)
	function plane(x0,y0,z0, x1,y1,z1, x2,y2,z2, cr,cg,cb, d,ph,pp,rf) {
		pl[numpl] = new Object();
		var p = pl[numpl];
		var nx,ny,nz,l;
		
		p.x=x0;		p.y=y0;		p.z=z0;
		p.ux=x1-x0;	p.uy=y1-y0;	p.uz=z1-z0;
		p.vx=x2-x0;	p.vy=y2-y0;	p.vz=z2-z0;
		p.cr=cr;	p.cg=cg;	p.cb=cb;	p.d=d;
		p.p=ph;		p.pp=pp;	p.rf=rf;
		// cross product to find normal
		p.nx=p.uy*p.vz - p.uz*p.vy;
		p.ny=p.uz*p.vx - p.ux*p.vz;
		p.nz=p.ux*p.vy - p.uy*p.vx;
		// normalise normal
		l = Math.sqrt(p.nx*p.nx + p.ny*p.ny + p.nz*p.nz);
		p.nx/=l;	p.ny/=l;	p.nz/=l;
		
		p.precalc = function() {
			// find D
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

		p.hit = pl_hit;
		p.intersect = pl_intersect;
		p.li_intersect = pl_li_intersect;
		p.getuv = function() {
			var dx,dy,dz;
			dx= ix-this.x;	dy= iy-this.y;	dz= iz-this.z;
			this.u = this.uo + (dx*this.ux + dy*this.uy + dz*this.uz)/this.ul2;
			this.v = 1 - this.vo - (dx*this.vx + dy*this.vy + dz*this.vz)/this.vl2;
		}

		p.precalc();
		p.obj = numob;
		ob[numob++] = pl[numpl];
		numpl++;
		return p;
	}
	
		function pl_intersect() {
			var t,dx,dy,dz,u,v,ix,iy,iz;
			if (this.obj==iobj) return;
			t = (this.D - this.nx*r.ox - this.ny*r.oy - this.nz*r.oz) /
				(this.nx*r.dx + this.ny*r.dy + this.nz*r.dz);
			if (t<=0 || t>=mt) return;
/*
			// incident point
			ix = r.ox + r.dx*t;
			iy = r.oy + r.dy*t;
			iz = r.oz + r.dz*t;
			dx= ix-this.x;	dy= iy-this.y;	dz= iz-this.z;
			u = dx*this.ux + dy*this.uy + dz*this.uz;
			if (u<0 || u>this.ul2) return;
			v = dx*this.vx + dy*this.vy + dz*this.vz;
			if (v<0 || v>this.vl2 || (u/this.ul2+v/this.vl2)>1) return;
	*/		
			mt=t; mo=this.obj;	mndir=1;
		}
		
		function pl_hit() {
			// incident point
			ix = r.ox + r.dx*mt;
			iy = r.oy + r.dy*mt;
			iz = r.oz + r.dz*mt;
			// normal
			nx = this.nx;
			ny = this.ny;
			nz = this.nz;
		}
		
		function pl_li_intersect() {
			if (this.obj==iobj) return false;
			var t;
			t = (this.D - this.nx*ix - this.ny*iy - this.nz*iz) / (this.nx*lx + this.ny*ly + this.nz*lz);
			return (t>0 && t<1);
		}
