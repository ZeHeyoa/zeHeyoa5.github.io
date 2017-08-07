
/********************
 * Texture functions
 */
	function tilebitmap() {
		var i;
		this.getuv();
		this.u = (this.u*this.bmpw % this.bmpw)|0;
		this.v = (this.v*this.bmph % this.bmph)|0;
		if (this.u<0) this.u+=this.bmpw;
		if (this.v<0) this.v+=this.bmph;
		i = (this.v*this.bmpw + this.u)*3;
		this.cr = this.bmp[i]*this.ocr;
		this.cg = this.bmp[i+1]*this.ocg;
		this.cb = this.bmp[i+2]*this.ocb;
	}
	
	function tilebitmap_bi() {
		var i,u,v,fu,fv,f,r,g,b,p;
		this.getuv();
		fu = (this.u*this.bmpw)%this.bmpw;	if (fu<0) fu+=this.bmpw;
		fv = (this.v*this.bmph)%this.bmph;	if (fv<0) fv+=this.bmph;
		u = fu|0;	fu-=u;	v = fv|0;	fv-=v;
		
		p = this.bmp;		i=(v*this.bmpw+u)*3;	f=(1-fu)*(1-fv);
		r=p[i]*f;	g=p[i+1]*f;		b=p[i+2]*f;
		
		u=(u+1)%this.bmpw;	i=(v*this.bmpw+u)*3;	f=fu*(1-fv);
		r+=p[i]*f;	g+=p[i+1]*f;	b+=p[i+2]*f;
		
		v=(v+1)%this.bmph;	i=(v*this.bmpw+u)*3;	f=fu*fv;
		r+=p[i]*f;	g+=p[i+1]*f;	b+=p[i+2]*f;
		
		u=(u-1)%this.bmpw;	i=(v*this.bmpw+u)*3;	f=(1-fu)*fv;
		r+=p[i]*f;	g+=p[i+1]*f;	b+=p[i+2]*f;
		
		this.cr = r*this.ocr;
		this.cg = g*this.ocg;
		this.cb = b*this.ocb;
	}
	
	function bitmap() {
		var i;
		this.getuv();
		this.u = (this.u*this.bmpw)|0;
		this.v = (this.v*this.bmph)|0;
		if (this.u<0 || this.v<0 || this.u>=this.bmpw || this.v>=this.bmph) {
			this.cr=this.ocr;	this.cg=this.ocg;	this.cb=this.ocb;
		} else {
			i = (this.v*this.bmpw + this.u)*3;
			this.cr = this.bmp[i]*this.ocr;
			this.cg = this.bmp[i+1]*this.ocg;
			this.cb = this.bmp[i+2]*this.ocb;
		}
	}
	
	function bitmap_bi() {
		var i,u,v,fu,fv,f,r,g,b,p;
		this.getuv();
		p = this.bmp;
		fu = this.u*this.bmpw;	u = fu|0;	fu-=u;
		fv = this.v*this.bmph;	v = fv|0;	fv-=v;
		i = (v*this.bmpw+u)*3;	f = (1-fu)*(1-fv);
		if (u<0||v<0||u>=this.bmpw||v>=this.bmph) { r=f;  g=f;  b=f; }
		else { r=p[i]*f;	g=p[i+1]*f;	b=p[i+2]*f; }
		u++; i+=3; f = fu*(1-fv);
		if (u<0||v<0||u>=this.bmpw||v>=this.bmph) { r+=f; g+=f; b+=f; }
		else { r+=p[i]*f;	g+=p[i+1]*f;	b+=p[i+2]*f; }
		v++; i+=this.bmpw*3; f = fu*fv;
		if (u<0||v<0||u>=this.bmpw||v>=this.bmph) { r+=f; g+=f; b+=f; }
		else { r+=p[i]*f;	g+=p[i+1]*f;	b+=p[i+2]*f; }
		u--; i-=3; f = (1-fu)*fv;
		if (u<0||v<0||u>=this.bmpw||v>=this.bmph) { r+=f; g+=f; b+=f; }
		else { r+=p[i]*f;	g+=p[i+1]*f;	b+=p[i+2]*f; }
		
		this.cr = r*this.ocr;
		this.cg = g*this.ocg;
		this.cb = b*this.ocb;
	}
	
	function envmap() {
		var i,u,v;
		u = (this.bmpwh + nx*this.bmpwh)|0;
		v = (this.bmphh - ny*this.bmphh)|0;
		i = (v*this.bmpw + u)*3;
		this.cr = this.bmp[i]*this.ocr;
		this.cg = this.bmp[i+1]*this.ocg;
		this.cb = this.bmp[i+2]*this.ocb;
	}
	
	function chequer1() {
		var u,v,i;
		this.getuv();
		u = Math.floor(this.u);
		v = Math.floor(this.v);
		i = (u^v)&1;
		this.cr=this.cg=i; this.cb=1-i;
	}
	function chequer2() {
		var u,v,i;
		this.getuv();
		u = Math.floor(this.u);
		v = Math.floor(this.v);
		this.cr=this.cg=this.cb=(u^v)&1;
	}

	function swirl() {
		var u;
		this.getuv();
		u = (this.u + this.v*this.vl)%this.ul;
		if (u>=0 && u<this.ul*0.33) {
			this.cr = this.cg = this.cb = 1;
		} else {
			this.cr = this.cg = this.cb = 0.5;
		}
	}
	
/*******************************************
 * Texture (image) load functions
 * NB: Due to browser security limitations, you can
 * only request images from the originating server
 */
	function setbitmap(o, imgurl) {
		if (textures[o.obj]==undefined) {
			texturewaiting++;
				
			var t = new Object();
			o.tex = t;
			t.i = new Image();
			t.i.ownerobj = o;
			t.i.onload = gotbitmap;
			t.i.src = imgurl;
			
			textures[o.obj] = t;
		} else {
			var t = textures[o.obj];
			o.tex  = t;
			o.bmp  = t.bmp;
			o.bmpw = t.i.width;
			o.bmph = t.i.height;
			o.bmpwh= t.i.width/2|0;
			o.bmphh= t.i.height/2|0;
		}
	}

	function gotbitmap() {	// this==Image()
		var o=this.ownerobj;
		if (o.tex) {
			var t=o.tex, w=this.width, h=this.height;
			if (show) {
				t.canv = document.createElement('CANVAS');
				t.canv.setAttribute('width', w);
				t.canv.setAttribute('height', h);
				t.ctx = t.canv.getContext("2d");
				t.ctx.drawImage(this, 0,0);
				o.bmp = new Array();
			}
			if (t.ctx && t.ctx.getImageData) {
				var pix = t.pix = t.ctx.getImageData(0,0,w,h).data;
				for (var i=0,j=0,b=o.bmp; i<w*h*4; i++) {
					b[j++]=pix[i++]/255;	b[j++]=pix[i++]/255;	b[j++]=pix[i++]/255;
				}
			} else {
				o.bmp = new Array();
				for (var i=0; i<w*h*3; i++) o.bmp[i]=0.5;
			}
			o.bmpw=w;		o.bmph=h;
			o.bmpwh=w/2|0;	o.bmphh=h/2|0;
			o.tex.bmp = o.bmp;
		} else {
			alert("Error loading "+this.src+" - expect script errors");
		}

		if (--texturewaiting<=0) startframe();
	}

	