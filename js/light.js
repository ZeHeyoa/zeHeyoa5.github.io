
	
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

	/*******************************
	 * Point light definition
	 */
	// Point light
	function light(x,y,z, r,g,b) {
		li[numli] = new Object();
		var l = li[numli];
		l.x=x;	l.y=y;	l.z=z;
		l.r=r;	l.g=g;	l.b=b;
		l.rad=5;

		l.precalc = function() {
			this.ir = 1/this.rad;
			this.c = this.x*this.x + this.y*this.y + this.z*this.z - this.rad*this.rad;
		};
		l.intersect = light_intersect;
		
		numli++;
		return l;
	}
	
		function light_intersect() {
			var b,b2,c,d, t;
			b = this.x*r.dx + this.y*r.dy + this.z*r.dz - r.odotd;
			if (b<0) return false;
			b2= b*b;
			c = r.odoto - 2*(this.x*r.ox + this.y*r.oy + this.z*r.oz) + this.c;
			d = b2 - r.ddotd*c;
			if (d<0) return false;
			if (b2>d) t=(b-Math.sqrt(d))/r.ddotd; else t=(b+Math.sqrt(d))/r.ddotd;
			if (t<=0 || t>=mt) return false;
			iz = r.oz + t*r.dz;
			nz = (iz - this.z)*this.ir;
			return true;
		}
