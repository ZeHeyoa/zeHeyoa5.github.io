
	/*************************************
	 * UI Stuffs
	 */

	function hun(x) { return Math.round(x*100)/100; }
	function randomview() {
		var a = Math.random()*2*3.141592654,
			e = Math.random()*300 - 30,
			r = 50 + Math.random()*350;
		cam.x = Math.round(r * Math.sin(a) * 10)/10;
		cam.z = Math.round(r * Math.cos(a) * 10)/10;
		cam.y = Math.round(e * 10)/10;

		//getl("dbg").innerHTML = "x:"+hun(cam.x)+", y:"+hun(cam.y)+", z:"+hun(cam.z);
		getl("xangle").value = cam.x;
		getl("yangle").value = cam.y;
		getl("zangle").value = cam.z;

		//anim = !anim;	if (anim)
		//load();
	}
	

	function changesize() {
		var x,y;
		switch (getl("sizesel").value) {
		case "100x80" :		x=100;	y=80;	break;
		case "200x160":		x=200;	y=160;	break;
		case "320x256":		x=320;	y=256;	break;
		case "400x320":		x=400;	y=320;	break;
		case "500x400":		x=500;	y=400;	break;
		case "640x512":		x=640;	y=512;	break;
		case "800x640":		x=800;	y=640;	break;
		case "1200x960":	x=1200;	y=960;	break;
		case "1680x1050":	x=1680;	y=1050;	break;
		default:return;
		}

		var div = getl("canvdiv");
		div.style.width = x+"px";
		div.style.height= y+"px";
		
		var canv = getl("canv");
		if (canv && canv.getContext) {
			canv.attributes.width.value = x;
			canv.attributes.height.value = y;
			canv.width = x;
			canv.height = y;
			imgdata = false;
		}
		load();
	}
	
	function changeaa() { antialias = getl("aacheck").checked; }