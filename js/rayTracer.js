/******************************
 * Simple Javascript Raytracer example,
 * 2008/10/20 - mark.webster@gmail.com
 * Feel free to do whatever you want with this source.
 */

/************
 * Vars
 */
	function getl(id) { return document.getElementById(id); }
	function checked(id) { return getl(id).checked; }
	
	var fov = 70;						// field of view
	var fovy;
	var eyez = -20;						// eye position in relation to viewplane
	var vw,vh;							// viewplane width/height (viewplane is z=0)
	var amb  = 0.15;					// ambient lighting
	var maxlevel = 20;					// maximum number of reflection recursions
	var eyez2=eyez*eyez;
	var rdn = 3.1415926535897932384626433832/180;

	var antialias = false;				// true = SLOOOOOOOOOOOOOOOOOOOOW!
	var bilinear = true;
	var cam	= {x:-290, y:28, z:-91, pixelMvt:8};	// camera position
//	var cam = {x:120.24, y:151.63, z:218.39};
	var look={x:-11, y:0, z:-50};		// look at point
	var up	={x:0, y:1, z:0	};			// up vector
	var viewmat = [ {x:1,y:0,z:0},		// the above 3 vectors will be normalised
					{x:0,y:1,z:0},		// and cross-produced into this matrix
					{x:0,y:0,z:1},
					{x:0,y:0,z:0}];
	
	var wid, hei;						// canvas width/height
	var wh, hh, ivw, ivh;
	
	var canv, ctx=false, imgdata=false, pix;
	var toggle=0;
	var show = false;
	
	var sp = new Array();
	var numsp = 0;
	var cy = new Array();
	var numcy = 0;
	var pl = new Array();
	var numpl = 0;
	var li = new Array();
	var numli = 0;
	
	var ob = new Array();
	var numob = 0;

	var framenum = 0;
	
	var textures = new Object();
	var texturewaiting = 0;


	/****************************************************
	 * Raytracing / intersection vars because passing args is slow
	 */
	var ix,iy,iz,	// incident (intersection) vector position
		idoti,		// incident dot incident
		iobj,		// last ray intersected object
		icyl,ndir,	// length along cylinder axis, and incident normal direction
		nx,ny,nz,	// normal at incident
		ez,			// vector to eye at incident (0-ix, 0-iy, eyez-iz)
		lx,ly,lz,	// vector from incident to current light
		ldotl,idotl,// light-dot-light, incident-dot-light
		cr,cg,cb;	// ray's accumulated colour (will be pixel)

	var xy;			// pointer to current pixel in buffer
	// Current ray
	var r = {ox:0, oy:0, oz:0, dx:0, dy:0, dz:0, odotd:0, odoto:0, ddotd:0};
	// Current closest intersect vars
	var mt,mo,mndir	// closest dist, object, and normal direction;



	function transform(x,y,z, tl) {
		var t = new Object();
		t.x = x*viewmat[0].x	+ y*viewmat[1].x	+ z*viewmat[2].x + viewmat[3].x*tl;
		t.y = x*viewmat[0].y	+ y*viewmat[1].y	+ z*viewmat[2].y + viewmat[3].y*tl;
		t.z = x*viewmat[0].z	+ y*viewmat[1].z	+ z*viewmat[2].z + viewmat[3].z*tl;
		return t;
	}
	
	function transform_obj(o) {
		var t;
		t = transform(o.x-look.x, o.y-look.y, o.z-look.z, 1);
		o.x=t.x;	o.y=t.y;	o.z=t.z;
		if (o.x1!=undefined) {
			t = transform(o.x1-look.x, o.y1-look.y, o.z1-look.z, 1);
			o.x1=t.x;	o.y1=t.y;	o.z1=t.z;
		}
		if (o.nx!=undefined) {
			t = transform(o.nx, o.ny, o.nz, 0);	o.nx=t.x;	o.ny=t.y;	o.nz=t.z;
		}
		if (o.ux!=undefined) {
			t = transform(o.ux, o.uy, o.uz, 0);	o.ux=t.x;	o.uy=t.y;	o.uz=t.z;
		}
		if (o.vx!=undefined) {
			t = transform(o.vx, o.vy, o.vz, 0);	o.vx=t.x;	o.vy=t.y;	o.vz=t.z;
		}
		if (o.wx!=undefined) {
			t = transform(o.wx, o.wy, o.wz, 0);	o.wx=t.x;	o.wy=t.y;	o.wz=t.z;
		}
	}
	
	
	function createviewmatrix() {
		var xx,xy,xz, yx,yy,yz, zx,zy,zz, tx,ty,tz, l;

		// Normalise up (y) vector
		l=Math.sqrt(up.x*up.x + up.y*up.y + up.z*up.z);
		yx=up.x/l;	yy=up.y/l;	yz=up.z/l;
		
		// Normalise lookat (z) vector
		zx=look.x-cam.x;	zy=look.y-cam.y;	zz=look.z-cam.z;
		l=Math.sqrt(zx*zx+zy*zy+zz*zz);
		zx=zx/l;	zy=zy/l;	zz=zz/l;
		
		// Cross-product (up x lookat) to get right vector
		xx = up.y*zz - up.z*zy;
		xy = up.z*zx - up.x*zz;
		xz = up.x*zy - up.y*zx;
		l=Math.sqrt(xx*xx+xy*xy+xz*xz);
		xx/=l;		xy/=l;		xz/=l;
		
		// Cross-product (lookat x right) to get orthogonal right vector
		yx = zy*xz - zz*xy;
		yy = zz*xx - zx*xz;
		yz = zx*xy - zy*xx;
		l=Math.sqrt(yx*yx+yy*yy+yz*yz);
		yx/=l;		yy/=l;		yz/=l;

		l=Math.sqrt(cam.x*cam.x + cam.y*cam.y + cam.z*cam.z);

		// Store the matrix
		viewmat[0].x=xx;	viewmat[0].y=yx;	viewmat[0].z=zx;
		viewmat[1].x=xy;	viewmat[1].y=yy;	viewmat[1].z=zy;
		viewmat[2].x=xz;	viewmat[2].y=yz;	viewmat[2].z=zz;
		viewmat[3].x=0;		viewmat[3].y=0;		viewmat[3].z=l;
	}
	
	function load() {
	/*	if (getl("xangle").value!="") cam.x = parseFloat(getl("xangle").value);
		if (getl("yangle").value!="") cam.y = parseFloat(getl("yangle").value);
		if (getl("zangle").value!="") cam.z = parseFloat(getl("zangle").value);
		getl("xangle").value = cam.x;
		getl("yangle").value = cam.y;
		getl("zangle").value = cam.z;*/

		curline=0;
		
		canv = getl("canvTmp1");
		if (canv && canv.getContext) {
			wid = canv.attributes.width.value;
			hei = canv.attributes.height.value;
			ctx = canv.getContext("2d");
			if (ctx.getImageData) show = true;
		}
		if (!show) {
			pix = new Array();
			wid = getl("canvdiv").clientWidth;
			hei = getl("canvdiv").clientHeight;
	
		}

		wh = wid/2;
		hh = hei/2;

		vw = -eyez * 2 / Math.tan((90-fov/2)*rdn);
		vh = vw * hei/wid;
		fovy = 2 * (90-Math.atan(-eyez/(vh/2))/rdn);
		ivw = vw/wid;
		ivh = vh/hei;

		renderframe();
	}
	
	function refresh() {
	
		if (curline>0) majGUI('msg' ,"Rendering: "+Math.round(curline*100/hei)+"%");
		
		if (show) {
			ctx.putImageData(imgdata, 0,0);
			// Hack to get firefox2 to show the updated canvas
			toggle=1-toggle;
			getl("canvdiv").style.left=toggle+"px";
		} else if (curline==0) {
			var x,y,xy,p=pix;
			for (xy=y=0; y<hei; y++) {
				for (x=0; x<wid; x++,xy+=4) {
					ctx.fillStyle="rgba("+p[xy]+","+p[xy+1]+","+p[xy+2]+",0.5)";
					ctx.fillRect(x,y,x+1,y+1);
				}
			}
	
		}
	}


	// Test ray/object intersection. Returns -1 if none, or index of object.
	// Will also find incident point in (ix,iy,iz)
	function intersect() {
		var i;
		mt=99999; mo=-1;

		for (i=0; i<numob; i++) ob[i].intersect(i);
		
		// Incident point & eye vector
		if (mo>=0) {
			ndir = mndir;
			ob[mo].hit(mt);	ez=iz-eyez;
			idoti = ix*ix + iy*iy + iz*iz;
		}
		return mo;
	}
		

	var last_li = new Array();
	var llast;
	
	// see if ray from incident point to the light intersects any object (shadows!)
	function li_intersect(l) {
		var i,last;
		
		// If normal points away from light, point is in shadow of intersected object
		if ((nx*lx+ny*ly+nz*lz)<=0) return true;
			
		ldotl = lx*lx + ly*ly + lz*lz;
		idotl = ix*lx + iy*ly + iz*lz;
		
		last = llast[l];
		if (last>=0 && ob[last].li_intersect()) { return true; }

		for (i=0; i<numob; i++) {
			if (i==last || !ob[i].li_intersect()) continue;
			llast[l] = i;
			return true;
		}
		return false;
	}
	
	
	function shade(obj) {
		var i,j,a,d,p,b,s, ll, rx,ry,rz;
		llast = last_li[level];
		s=ob[obj];
		a=-1;
		cr=cg=cb=0;
		if (ndir<0 && s.inside) s=s.inside;
		if (s.texture) s.texture();
		// sum the lights
		for (i=0; i<numli; i++) {
			// light vector
			lx = li[i].x - ix;
			ly = li[i].y - iy;
			lz = li[i].z - iz;
			// early out if in shadow
			if (li_intersect(i)) continue;

			// distance to light
			ll = 1/Math.sqrt(lx*lx+ly*ly+lz*lz);
			
			// diffuse (lambert) = cos(|normal dot light|)
			d = (nx*lx+ny*ly+nz*lz)*ll;
			if (d<0) d=0; else d*=s.d;
			
			// light reflection vector
			b = 2*(lx*nx+ly*ny+lz*nz);
			rx = b*nx - lx;
			ry = b*ny - ly;
			rz = b*nz - lz;
			
			// phong = cos(|light reflection dot eye|)^n
			if (a<0) a = 1/Math.sqrt(ix*ix + iy*iy + ez*ez);
			p = -(rx*ix+ry*iy+rz*ez)*a*ll;
			if (p<0) { if (d==0) continue; p=0; }
			else { p=Math.pow(p,s.pp)*s.p; }
			
			cr += (d*s.cr + p)*li[i].r;
			cg += (d*s.cg + p)*li[i].g;
			cb += (d*s.cb + p)*li[i].b;

			//if (cr < 0.1) cr = 0.1; if (cg < 0.1) cg = 0.2;	if (cb < 0.1) cb = 0.5;
		}
	}
	
	var pcr,pcg,pcb,level,rf;
	function cast() {
		var t, obj,o;
		
		iobj = -1;
		level = 0;
		// find closest intersection
		obj = intersect();
		for (o=0; o<numli; o++) { if (li[o].intersect()) obj=numob+o; }
		if (obj>=numob) {
			o = li[obj-numob];	nz=0.5-nz*2;
			pcr+=o.r*nz;	pcg+=o.g*nz;	pcb+=o.b*nz;
			return true;
		}
		if (obj<0) return false;
		iobj = obj;

		shade(obj);
		t = (ndir<0 && ob[obj].inside) ? ob[obj].inside : ob[obj];
		pcr+=cr+t.cr*amb;
		pcg+=cg+t.cg*amb;
		pcb+=cb+t.cb*amb;
		rf=1;
		
		// recurse reflections
		for (level=1; level<maxlevel; level++) {
			rf *= (ndir<0 && ob[obj].inside) ? ob[obj].inside.rf : ob[obj].rf;
			if (rf<=0) break;
			// calculate reflected ray
			t = 2*(nx*r.dx + ny*r.dy + nz*r.dz);
			r.ox = ix;		r.oy = iy;		r.oz = iz;
			r.dx-= t*nx;	r.dy-= t*ny;	r.dz-= t*nz;
			// some dot-prods
			r.odotd = r.ox*r.dx + r.oy*r.dy + r.oz*r.dz;
			r.odoto = r.ox*r.ox + r.oy*r.oy + r.oz*r.oz;

			// find closest intersection
			obj = intersect(obj);
			
			if (obj<0) break;
			iobj = obj;
			shade(obj);
			
			pcr+=cr*rf;	pcg+=cg*rf;	pcb+=cb*rf;
		}
		//if (level>=20) { pcr=pcg=pcb=1; }
		return true;
	}
	
	var curline = 0;
	var start;
	var anim=false;
	
	function renderframe() {
		var i;
		if (curline>0) return;
		curline = 0;
		
/*		var ang = (framenum*15)*3.141592654/180;
		ang = Math.sin(ang*3.141592654/2);
		var sin = Math.sin(ang),
			cos = Math.cos(ang);
		cam.x = 0;
		cam.y = sin*300;
		cam.z = 1 - (cos)*300;
		//cam.x = sin*300;
		//cam.y = 0;
		//cam.z = -cos*300;*/

		if (scene()) startframe();
		// else startframe() will be called back when pending images have loaded
	}
	
	function startframe() {
		if (show && !imgdata) {
			ctx.fillRect(0,0, wid,hei);
			imgdata = ctx.getImageData(0,0,wid,hei);
			pix = imgdata.data;
		} 

		majGUI('msg' ,"Rendering: 0%");
		start = new Date();
		refresh();
		tick();
	}

	function tick() {
		var x,y, lr=0,lg=0,lb=0,R,G,B,d,xa,ya;
		var num=0;

		if (!antialias) {
			pcr=pcg=pcb=0;
			for (xy=curline*wid*4, y=curline-hh; y<hh && num<2; y++,num++,curline++) {
				for (x=-wh; x<wh; x++,xy+=4) {
					r.ox = r.dx = ivw*x;
					r.oy = r.dy = -ivh*y;
					r.oz = 0;	r.dz = -eyez;
					r.odoto = r.odotd = r.ox*r.ox + r.oy*r.oy;
					r.ddotd = r.odoto + r.dz*r.dz;
					
					if (!cast()) {
						pix[xy]=51;
						pix[xy+1]=112;
						pix[xy+2]=130;
						continue;
					}
					pix[xy]=(pcr>1)?255:(pcr*255|0);
					pix[xy+1]=(pcg>1)?255:(pcg*255|0);
					pix[xy+2]=(pcb>1)?255:(pcb*255|0);
					pcr=pcg=pcb=0;
				}
			}
		} else {
			for (xy=curline*wid*4, y=curline-hh; y<hh && num<2; y++,num++,curline++) {
				for (x=-wh; x<wh; x++,xy+=4) {
					pcr=pcg=pcb=0;
					r.ox=r.dx=(x-0.25)*ivw;	r.oy=r.dy=(-y-0.25)*ivh;	r.oz=0;	r.dz=-eyez;
					r.odotd=r.odoto=r.ox*r.ox+r.oy*r.oy;	r.ddotd=r.odoto+eyez2;	cast();
//					R=lr-pcr; G=lg-pcg; B=lb-pcb; d=R*R+G*G+B*B;
//					if (d>0.5) {
						r.ox=r.dx=(x+0.25)*ivw;	r.oy=r.dy=(-y-0.25)*ivh;	r.oz=0;	r.dz=-eyez;
						r.odotd=r.odoto=r.ox*r.ox+r.oy*r.oy;	r.ddotd=r.odoto+eyez2;	cast();
						r.ox=r.dx=(x-0.25)*ivw;	r.oy=r.dy=(-y+0.25)*ivh;	r.oz=0;	r.dz=-eyez;
						r.odotd=r.odoto=r.ox*r.ox+r.oy*r.oy;	r.ddotd=r.odoto+eyez2;	cast();
						r.ox=r.dx=(x+0.25)*ivw;	r.oy=r.dy=(-y+0.25)*ivh;	r.oz=0;	r.dz=-eyez;
						r.odotd=r.odoto=r.ox*r.ox+r.oy*r.oy;	r.ddotd=r.odoto+eyez2;	cast();
						pix[xy]=(pcr>4)?255:(pcr*63.75|0);
						pix[xy+1]=(pcg>4)?255:(pcg*63.75|0);
						pix[xy+2]=(pcb>4)?255:(pcb*63.75|0);
//					} else {
//						pix[xy]=(pcr>1)?255:(pcr*255|0);
//						pix[xy+1]=(pcg>1)?255:(pcg*255|0);
//						pix[xy+2]=(pcb>1)?255:(pcb*255|0);
//					}
//					lr=pcr; lg=pcg; lb=pcb;
				}
			}
		}
		
		if (curline<hei) {
			tick();
		} else {
		
			var end = new Date();
			majGUI('msg' ,framenum+" Time: "+(end.getTime()-start.getTime())+"ms");
			curline = 0;
			if (ctx && !show) {
				majGUI('msg' ,"Plotting...");
				refresh();
			} else
				refresh();
				
			framenum++;
			
			if (anim) {
				renderframe();
			}
			
      var canv2 = getl("canv");
      if (canv2 && canv2.getContext) {

         canv2.getContext('2d').drawImage(getl("canvTmp1"), 0,0, canv2.width, canv2.height);
          }
      
			
		}
	}
	
	

	
