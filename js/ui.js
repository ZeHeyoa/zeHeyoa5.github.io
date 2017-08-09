
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
	
	function changeaa() { antialias = getl("aacheck").checked; }
	
	
 var objet = function() {
   this.posXcam= cam.x,
   this.posYcam= cam.y,
   this.posZcam= cam.z,
   
   this.msg= "",
   this.pixelMvt= cam.pixelMvt
   };
      
   var obj = new objet();
   var gui = new dat.GUI({  load: JSON });
   gui.remember(obj);

   var maj  = function(value) { 
   cam.x = obj.posXcam;
   cam.y = obj.posYcam;
   cam.z = obj.posZcam;
   cam.pixelMvt = obj.pixelMvt;
   
      
   	var x=screen.width,y=screen.height;
   		var div = getl("canvdiv");
		div.style.width = x+"px";
		div.style.height= y+"px";
		var canv = getl("canvTmp1");
		if (canv && canv.getContext) {
			canv.attributes.width.value = x;
			canv.attributes.height.value = y;
			canv.width = Math.floor((x * 1/cam.pixelMvt)/10)*10;
			canv.height = Math.floor((y * 1/cam.pixelMvt)/10)*10;
			imgdata = false;
		}
		load();
   
   }

   var maj2  = function(value) {  
      cam.x = obj.posXcam;
   cam.y = obj.posYcam;
   cam.z = obj.posZcam;
   
     	var x=screen.width,y=screen.height;
   		var div = getl("canvdiv");
		div.style.width = x+"px";
		div.style.height= y+"px";
		var canv = getl("canvTmp1");
		if (canv && canv.getContext) {
			canv.attributes.width.value = x;
			canv.attributes.height.value = y;
			canv.width = x;
			canv.height = y;
			imgdata = false;
		}
		load();

   }
   
   var majGUI = function(n,v){
  for(var i = 0; i<gui.__folders.Mouvement.__controllers.length;i++){
      if( gui.__folders.Mouvement.__controllers[i].property == n ) gui.__folders.Mouvement.__controllers[i].setValue(v);
   }
};
   
   f = gui.addFolder('Mouvement');
   f.add(obj, "posXcam").min(-1000).max(1000).onChange(maj).onFinishChange(maj2);   
   f.add(obj, "posYcam").min(-1000).max(1000).onChange(maj).onFinishChange(maj2);
   f.add(obj, "posZcam").min(-1000).max(1000).onChange(maj).onFinishChange(maj2);
   f.add(obj, "msg");   
   f.add(obj, "pixelMvt").min(0).max(124).onChange(maj).onFinishChange(maj2);  
   f.open();
 load();