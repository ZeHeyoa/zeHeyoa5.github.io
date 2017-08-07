          
  var scene = {};
  
  scene.camera = {
      point: {
          x: 4.5,
          y: .14,
          z: 35
      },
      fieldOfView: 90,
      vector: {
          x: 0,
          y: 0,
          z: 0
      },
      pixel:1,
      vision: null,
      width: 0,
      height: 0,
      startTime: 0   
  };
  
  scene.vision = null;
  scene.width = 0;
  scene.height= 0;   
  
  
  
  
  scene.lights = [{
      x: 45,
      y: -90,
      z: 90
  }];
  
  scene.objects = [
      {
          type: 'sphere',
          point: {
              x: -4,
              y: 10,
              z: -30
          },
          color: {
              x: 195,
              y: 155,
              z: 195
          },
          specular: 0.1,
          lambert: 0.9,
          ambient: 0.0,
          radius: 10
      }
  ];
  
  
  var Vector = {};
  
  Vector.UP = { x: 0, y: 1, z: 0 };
  Vector.ZERO = { x: 0, y: 0, z: 0 };
  Vector.WHITE = { x: 255, y: 255, z: 255, a:0 };
  Vector.ZEROcp = function() {
      return { x: 0, y: 0, z: 0 };
  };
  
  Vector.dotProduct = function(a, b) {
      return (a.x * b.x) + (a.y * b.y) + (a.z * b.z);
  };
  
  
  Vector.crossProduct = function(a, b) {
      return {
          x: (a.y * b.z) - (a.z * b.y),
          y: (a.z * b.x) - (a.x * b.z),
          z: (a.x * b.y) - (a.y * b.x)
      };
  };
  
  Vector.scale = function(a, t) {
      return {
          x: a.x * t,
          y: a.y * t,
          z: a.z * t
      };
  };
  
  
  Vector.unitVector = function(a) {
      return Vector.scale(a, 1 / Vector.length(a));
  };
  
  
  Vector.add = function(a, b) {
      return {
          x: a.x + b.x,
          y: a.y + b.y,
          z: a.z + b.z
      };
  };
  
  
  Vector.add3 = function(a, b, c) {
      return {
          x: a.x + b.x + c.x,
          y: a.y + b.y + c.y,
          z: a.z + b.z + c.z
      };
  };
  
  Vector.subtract = function(a, b) {
      return {
          x: a.x - b.x,
          y: a.y - b.y,
          z: a.z - b.z
      };
  };
  
  Vector.subtract3 = function(a,b,r) {
      r.x = a.x - b.x;
      r.y = a.y - b.y;
      r.z = a.z - b.z;   
  };
  
  Vector.length = function(a) {
      return Math.sqrt(Vector.dotProduct(a, a));
  };
  
  Vector.reflectThrough = function(a, normal) {
      var d = Vector.scale(normal, Vector.dotProduct(a, normal));
      return Vector.subtract(Vector.scale(d, 2), a);
  };
  
     var pixel = 1/scene.camera.pixel; 
      var width = Math.floor((screen.width * pixel)/10)*10;
      var height = Math.floor((screen.height * pixel)/10)*10;
  	var arr = new Uint8ClampedArray((width*height)*4);	 
      scene.vision = arr;
      scene.width = width;
      scene.height = height;  
          var camera = scene.camera,
          objects = scene.objects,
          lights = scene.lights,
          data = scene.vision,
          width = scene.width,
          height = scene.height; 
      var eyeVector = Vector.unitVector(Vector.subtract(camera.vector, camera.point)),
          vpRight = Vector.unitVector(Vector.crossProduct(eyeVector, Vector.UP)),
          vpUp = Vector.unitVector(Vector.crossProduct(vpRight, eyeVector)),
          fovRadians = Math.PI * (camera.fieldOfView / 2) / 180,
          heightWidthRatio = height / width,
          halfWidth = Math.tan(fovRadians),
          halfHeight = heightWidthRatio * halfWidth,
          camerawidth = halfWidth * 2,
          cameraheight = halfHeight * 2,
          pixelWidth = camerawidth / (width - 1),
          pixelHeight = cameraheight / (height - 1);
  
      var index, color;
      var ray = {
          point: camera.point,
          eye: {x:0,y:0,z:0}
      };
  	var arr=[],b=(width*height);while(b--)arr[b]=b+1;
  	
  	
  
  function renduDoubleFor(scene) {				  
  var xcomp =0;
  var ycomp= 0;
  	for (var x = 0; x < width; x++) {
    xcomp = Vector.scale(vpRight, (x * pixelWidth) - halfWidth);
     for (var y = 0; y < height; y++) {
    ycomp = Vector.scale(vpUp, (y * pixelHeight) - halfHeight);
  	ray.vector = Vector.unitVector(Vector.add3(eyeVector, xcomp, ycomp));
  	var color = trace(ray, scene, 0);
  	var index = (x * 4) + (y * width * 4);
  	
    data[index + 0] = color.x;
  	data[index + 1] = color.y;
  	data[index + 2] = color.z;
  	data[index + 3] = (color.a !== undefined) ? 0 :  255;		
  
  	 }
  	}	
    return data; 
  }
  
    function renduForEach(scene,q,v,r) {		
    var z=arr.length;
     for (var i= z*r, len = z*(r+v); i < len; i++) {
       raytracerIndex(i, scene.vision);
     }
    }
  
  function renduz(scene, v) {	
    var r = 0;  
      var q=0;
  	for(;q<1;q+=v){  
  		renduForEach(scene , q,v,r);
  		r =q;
  	}
  } 	
  
  function raytracerIndex(i, data){
     raytracer(data, i % width, i / width | 0);
  }
  
  var xx = -1;
  var xcomp = 0;
  var ycomp = 0;
  function raytracer(data, x, y){
    if(xx !== x){
     xcomp = Vector.scale(vpRight, (x * pixelWidth) - halfWidth);
     xx = x;
    }	
  	ycomp = Vector.scale(vpUp, (y * pixelHeight) - halfHeight);
  	ray.vector = Vector.unitVector(Vector.add3(eyeVector, xcomp, ycomp));
  	var color = trace(ray, scene, 0);
  	var index = (x * 4) + (y * width * 4);
  	
  	data[index + 0] = color.x;
  	data[index + 1] = color.y;
  	data[index + 2] = color.z;
  	data[index + 3] = (color.a !== undefined) ? 0 :  255;			
  
  }       		
  
   
  
  function trace(ray, scene, depth) {
      if (depth > 1) return;
  
      var distObject = intersectSceneOld(ray, scene);
      if (distObject[0] === Infinity) {
          return Vector.WHITE;
      }
  
      var dist = distObject[0],
          object = distObject[1];
  
  	 var pointAtTime = Vector.add(ray.point, Vector.scale(ray.vector, dist));
       return surface(ray, scene, object, pointAtTime, sphereNormal(object, pointAtTime), depth);	
  }
  
  
  function intersectSceneOld(ray, scene) {
      var closest = [Infinity, null];
      for (var i = 0; i < scene.objects.length; i++) {
          var object = scene.objects[i];
          var dist = sphereIntersection(object, ray);	
          if (dist !== undefined && ((dist < -0.001 && closest[0] < -0.001 && dist > closest[0]) || dist < closest[0])) {
              closest = [dist, object];
          }
      }
      return closest;
  }
  
  
  function sphereIntersection(sphere, ray) {
      Vector.subtract3(sphere.point, ray.point,ray.eye);
      var v = Vector.dotProduct(ray.eye, ray.vector);
      var v2 = (sphere.radius * sphere.radius) - Vector.dotProduct(ray.eye, ray.eye) + (v * v);
      if (v2  < 0) {
	  	   if(ray.isEyeScreen && ray.discriminant < v2) {
          ray.discriminant = v2;
        } 
          return undefined;
      } else {
	       ray.discriminant =1;
          return v  - Math.pow(v2,0.5);
      }
  }
  
  function sphereNormal(sphere, pos) {
      return Vector.unitVector(
          Vector.subtract(pos, sphere.point));
  }
  
  
  function surface(ray, scene, object, pointAtTime, normal, depth) {
      var b = object.color,
          c = Vector.ZERO,
          lambertAmount = 0;
  
      if (object.lambert) {
          for (var i = 0; i < scene.lights.length; i++) {
              var lightPoint = scene.lights[0];
              if (!isLightVisible(pointAtTime, scene, lightPoint)) continue;
  
              var contribution = Vector.dotProduct(Vector.unitVector(
                  Vector.subtract(lightPoint, pointAtTime)), normal);
              if (contribution > 0) lambertAmount += contribution;
          }
      }
  
      if (object.specular) {
         var reflectedRay = {
              point: pointAtTime,
          eye: {x:0,y:0,z:0},
              vector: Vector.reflectThrough(ray.vector, normal),
                 discriminant : 999,
				isEyeScreen : false
          };
          var reflectedColor = trace(reflectedRay, scene, ++depth);
          if (reflectedColor) {
              c = Vector.add(c, Vector.scale(reflectedColor, object.specular));
          }
      }
  
      lambertAmount = Math.min(1, lambertAmount);
      return Vector.add3(c,
          Vector.scale(b, lambertAmount * object.lambert),
          Vector.scale(b, object.ambient));
  }
  
  
  function isLightVisible(pt, scene, light) {
      var rayl = {
          point: pt,
          eye: {x:0,y:0,z:0},
          vector: Vector.unitVector(Vector.subtract(pt, light)),
        discriminant : 999,
		isEyeScreen : false
      };
      var distObject =  intersectSceneOld(rayl, scene);
      return distObject[0] > -0.005;
  }
  
  function renduDoubleForInverse(scene) {				  
      var x = width;
  	var y = 0;
  	for (; x > 0; --x) {
  	 y = height;
  	 for (; y > 0; --y) {
        raytracer(data, width - x , height -y);
  	 }
  	}	
    return data; 
  }
  
  var iterations  = width*height;
  
  
function rendu2(scene) {
        var camera = scene.camera,
        objects = scene.objects,
        lights = scene.lights,
        data = scene.vision,
        width = scene.width,
        height = scene.height; 
        // This process
    // is a bit odd, because there's a disconnect between pixels and vectors:
    // given the left and right, top and bottom rays, the rays we shoot are just
    // interpolated between them in little increments.
    //
    // Starting with the height and width of the scene, the camera's place,
    // direction, and field of view, we calculate factors that create
    // `width*height` vectors for each ray

    // Start by creating a simple vector pointing in the direction the camera is
    // pointing - a unit vector
    var eyeVector = Vector.unitVector(Vector.subtract(camera.vector, camera.point)),

        // and then we'll rotate this by combining it with a version that's turned
        // 90° right and one that's turned 90° up. Since the [cross product](http://en.wikipedia.org/wiki/Cross_product)
        // takes two vectors and creates a third that's perpendicular to both,
        // we use a pure 'UP' vector to turn the camera right, and that 'right'
        // vector to turn the camera up.
        vpRight = Vector.unitVector(Vector.crossProduct(eyeVector, Vector.UP)),
        vpUp = Vector.unitVector(Vector.crossProduct(vpRight, eyeVector)),

        // The actual ending pixel dimensions of the image aren't important here -
        // note that `width` and `height` are in pixels, but the numbers we compute
        // here are just based on the ratio between them, `height/width`, and the
        // `fieldOfView` of the camera.
        fovRadians = Math.PI * (camera.fieldOfView / 2) / 180,
        heightWidthRatio = height / width,
        halfWidth = Math.tan(fovRadians),
        halfHeight = heightWidthRatio * halfWidth,
        camerawidth = halfWidth * 2,
        cameraheight = halfHeight * 2,
        pixelWidth = camerawidth / (width - 1),
        pixelHeight = cameraheight / (height - 1);

    var index, color;
    var ray = {
        point: camera.point,
        eye: {x:0,y:0,z:0},
		isEyeScreen : (scene.camera.pixel < 2) ? true : false,
        discriminant : 999
    };
				  
 var xcomp =0; 
    var ycomp = new Array();
    var decal=0;
    for (var x = 0; x < width; x++) {
        xcomp = Vector.scale(vpRight, (x * pixelWidth) - halfWidth);
        var qa = Vector.add(eyeVector, xcomp);
        for (var y = 0; y < height; y++) {

            // turn the raw pixel `x` and `y` values into values from -1 to 1
            // and use these values to scale the facing-right and facing-up
            // vectors so that we generate versions of the `eyeVector` that are
            // skewed in each necessary direction.
            if(x === 0) ycomp.push(Vector.scale(vpUp, (y * pixelHeight) - halfHeight));
            
            if(decal === 0) {
              ray.vector = Vector.unitVector(Vector.add(qa, ycomp[y]));   
              color = trace(ray, scene, 0);
			  
			  if(ray.discriminant<-10 && ray.discriminant>-100){
				decal= (ray.isEyeScreen) ? 3 : 0; 
						/*	color.x = 255;
			color.y = 75;
			color.z = 255;            
            color.a = 255;*/
			  } else if (ray.discriminant<-100){
                decal= (ray.isEyeScreen) ? 10 : 0; 
			/*color.x = 255;
			color.y = 25;
			color.z = 25;            
            color.a = 255;*/
			  }
            } else {  
			color.x = 5;
			color.y = 5;
			color.z = 255;            
            color.a = 255;			
            decal--;
            }           
			
            index = (x * 4) + (y * width * 4),
            data[index + 0] = color.x;
            data[index + 1] = color.y;
            data[index + 2] = color.z;
            data[index + 3] = (color.a !== undefined) ? color.a :  255;
			
            ray.discriminant =-999;
         }
    }
  return data; 
}

  
  
  
  
  function renduLine(scene) {
        var camera = scene.camera,
        objects = scene.objects,
        lights = scene.lights,
        data = scene.vision,
        width = scene.width,
        height = scene.height; 

    var eyeVector = Vector.unitVector(Vector.subtract(camera.vector, camera.point)),
        vpRight = Vector.unitVector(Vector.crossProduct(eyeVector, Vector.UP)),
        vpUp = Vector.unitVector(Vector.crossProduct(vpRight, eyeVector)),
        fovRadians = Math.PI * (camera.fieldOfView / 2) / 180,
        heightWidthRatio = height / width,
        halfWidth = Math.tan(fovRadians),
        halfHeight = heightWidthRatio * halfWidth,
        camerawidth = halfWidth * 2,
        cameraheight = halfHeight * 2,
        pixelWidth = camerawidth / (width - 1),
        pixelHeight = cameraheight / (height - 1);

    var index, color;
    var ray = {
        point: camera.point,
		eye: {x:0,y:0,z:0},
        discriminant : -999,
		isEyeScreen : (scene.camera.pixel < 2) ? true : false
    };				  
	
 var p1 = Vector.unitVector(Vector.add(Vector.add(eyeVector, Vector.scale(vpRight, (0 * pixelWidth) - halfWidth)),
              Vector.scale(vpUp, (0 * pixelHeight) - halfHeight)));	
 var p2 = Vector.unitVector(Vector.add(Vector.add(eyeVector, Vector.scale(vpRight, ((width-1) * pixelWidth) - halfWidth)),
              Vector.scale(vpUp, (0 * pixelHeight) - halfHeight)));	
 var p3 = Vector.unitVector(Vector.add(Vector.add(eyeVector, Vector.scale(vpRight, ((width-1) * pixelWidth) - halfWidth)),
              Vector.scale(vpUp, ((height-1) * pixelHeight) - halfHeight)));
 var p4 = Vector.unitVector(Vector.add(Vector.add(eyeVector, Vector.scale(vpRight, (0 * pixelWidth) - halfWidth)),
              Vector.scale(vpUp, ((height-1) * pixelHeight) - halfHeight)));	
	  
  for (var x = 0; x < width; x++) {
     var xi = x/width;
     var pH = [(1 - xi) * p1.x + xi * p2.x, (1 - xi) * p1.y + xi * p2.y , (1 - xi) * p1.z + xi * p2.z];
	 var pB = [(1 - xi) * p4.x + xi * p3.x, (1 - xi) * p4.y + xi * p3.y , (1 - xi) * p4.z + xi * p3.z];
     for (var y = 0; y < height; y++) {	  
	   var yi = y/height;
       ray.vector =  {x:(1 - yi) * pH[0] + yi * pB[0], y:(1 - yi) * pH[1] + yi * pB[1] , z:(1 - yi) * pH[2] + yi * pB[2]};
       color = trace(ray, scene, 0);
       index = (x * 4) + (y * width * 4),
       data[index + 0] = color.x;
       data[index + 1] = color.y;
       data[index + 2] = color.z;
       data[index + 3] = (color.a !== undefined) ? color.a :  255;			
     }
  }
  return data; 
}


  renduLine(scene);
  