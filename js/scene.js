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
/************************
 * Scenegraph
 */
	function scene() {
		texturewaiting = 0;
		var s,p,d;
		
		bilinear = getl("bicheck").checked;
		var bitfunc = bilinear ? bitmap_bi : bitmap;
		var tilefunc = bilinear ? tilebitmap_bi : tilebitmap;
		
		ob = new Array();
		sp = new Array();
		pl = new Array();
		li = new Array();
		cy = new Array();
		numob = numsp = numpl = numli = numcy = 0;


	// (x,y,z)=centre, r=radius
	// sphere(x,y,z,r, cr,cg,cb, d,p,pp,rf) {
		
		//sphere(  0,   100,   200, 170, 0.1,0.1,0.1, 0.5,1.0,64, 1.0);	// white sphere
		//sphere( -40, -45,-130, 25, 1,0,0, 1.0,1.0, 8, 0.6).			// red sphere
 	   	 //setuv(1,0,0, 0,1,0, 0,0, tilefunc).setbitmap("bresil.jpg");
sphere( 0, 100, -50, 500,  0,0,1, 0,0,0, 0).sethalf(0,-1,0,  0,0,1, 0,0,0, 1);
sphere( 0, -200, -50, 500,  0,1,0, 0,0,0, 0).sethalf(0,1,0,  0,0,1, 0,0,0, 1);
		//sphere(  95, -50,-125, 20, 0,0,1, 0.8,0.7,16, 0.6);			// blue sphere

	// (x0,y0,z0)-(x1,y1,z1)-(x2,y2,z2) = co-planar point (counter-clockwise)
	// plane(x0,y0,z0, x1,y1,z1, x2,y2,z2, cr,cg,cb, d,ph,pp,rf) 
		
		//plane(0,-70,0, 0,-70,-10, -20,-70,0, 1,1,1, 0.6,1.0,32, 0.4).setuv(300,0,0, 0,0,300, 0,0, tilefunc).setbitmap("c.jpg");
		
		//disc(0,60,140,	0,0,-1,		150, 1,1,1, 0.5,1.0,64, 0.6).setuv(300,0,0, 0,300,0, 0.5,0.5, bitfunc).setbitmap("b.jpg");
		disc(0,-70,-50,	0,1,0,		130, 1,1,1, 0.2,0.1,0.5, 0.005)
		.setuv(200,0,0, 0,0,200, 0.5,0.55, tilefunc)
		.setbitmap("image/ca.png");
		
		//function(ux,uy,uz, vx,vy,vz, uo,vo, texturefunc) {
					//disc(-110,-50,-100,	0,1,0,		100, 1,1,1, 0.6,1.0,128, 0.4).setuv(200,0,0, 0,0,200, 0.5,0.5, bitfunc).setbitmap("mo.jpg");
			
	/*	disc(-150,0,-50, 1,0.2,-0.2, 70, 0,0,0, 0.5,1.0,32, 0.2).		// left
			setuv(0,20,0, 0,0,20, 0,0,	chequer1);
		disc(150,0,-50, -1,0.2,-0.2, 70, 0,0,0, 0.5,1.0,32, 0.4).		// right
			setuv(0,20,0, 0,0,20, 0,0,	chequer2);
*/
		//cylinder(0,-50,-50, 40,-50,-160, 20, 1,1,0, 0.5,1.0,32, 0.5);
		
		// (x,y,z)=base, (x1,y1,z1)=end, r=radius
	   // cylinder(x,y,z, x1,y1,z1, r, cr,cg,cb, d,p,pp,rf) 		
		cylinder(20,-70,-110, 20,20,-110, 30, 1,1,1, 0.6,1.0,32, 0.25)
			.setuv(-3,0,0, 0,1,0, 0,0, tilefunc)
			.setbitmap("image/vee.jpg")
			.setinside(0.35,0.35,0.35, 0.5,1.0,32, 1.0)
			.setuv(10,0,0, 0,6,0, 0,0, tilefunc).setbitmap("image/f.jpg");

		//disc(0,500,0, 0,0.2,0, 30000, 0,0,1, 0.5,1.0,32, 2);
		sphere( 0, 20,10, 20, 0.9,0.4,0.4, 0.5,1.0,32, 1.0);
		
 
		light( -100, 400, -10, 1,1,1);	// white light
		light(0,   400,-10, 1,1,1);	// purple light
		light(100, 400,-20, 1,1,1);
		light(-100, 400,-30, 1,1,1);
	        light(0, 100,-50, 1,1,1);
		createviewmatrix();
		
		// apply transform
		var i,j,k;
		for (i=0; i<numli; i++) {
			transform_obj(li[i]);
			li[i].precalc();
		}
		for (i=0; i<numob; i++) {
			transform_obj(ob[i]);
			if (ob[i].precalc) ob[i].precalc();
			if (ob[i].inside) {
				transform_obj(ob[i].inside);
				ob[i].inside.precalc();
			}
		}
		
		for (j=0; j<maxlevel; j++) {
			last_li[j] = new Array();
			for (k=0; k<numli; k++) last_li[j][k]=-1;
		}
		
		return !texturewaiting;
	}
	

	
