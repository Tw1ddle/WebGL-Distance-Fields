(function (console, $global) { "use strict";
var $estr = function() { return js_Boot.__string_rec(this,''); };
function $extend(from, fields) {
	function Inherit() {} Inherit.prototype = from; var proto = new Inherit();
	for (var name in fields) proto[name] = fields[name];
	if( fields.toString !== Object.prototype.toString ) proto.toString = fields.toString;
	return proto;
}
var HxOverrides = function() { };
HxOverrides.__name__ = true;
HxOverrides.indexOf = function(a,obj,i) {
	var len = a.length;
	if(i < 0) {
		i += len;
		if(i < 0) i = 0;
	}
	while(i < len) {
		if(a[i] === obj) return i;
		i++;
	}
	return -1;
};
var Main = function() {
	this.keycode = 0;
	this.shaderGUI = new dat.GUI({ autoPlace : true});
	this.sceneGUI = new dat.GUI({ autoPlace : true});
	this.signal_windowResized = new msignal_Signal0();
	this.signal_letterTyped = new msignal_Signal1();
	this.displayShaders = ["AA","OVERLAY","GRAYSCALE","RGB","PASSTHROUGH"];
	this.displayShader = "AA";
	this.passthroughMaterials = [];
	this.overlayMaterials = [];
	this.rgbMaterials = [];
	this.grayscaleMaterials = [];
	this.aaMaterials = [];
	this.keyStrInput = [];
	this.sdfMap = new haxe_ds_StringMap();
	window.onload = $bind(this,this.onWindowLoaded);
};
Main.__name__ = true;
Main.main = function() {
	var main = new Main();
};
Main.prototype = {
	onWindowLoaded: function() {
		var _g = this;
		var gameDiv = window.document.createElement("attach");
		var glSupported = WebGLDetector.detect();
		if(glSupported != 0) {
			var unsupportedInfo = window.document.createElement("div");
			unsupportedInfo.style.position = "absolute";
			unsupportedInfo.style.top = "10px";
			unsupportedInfo.style.width = "100%";
			unsupportedInfo.style.textAlign = "center";
			unsupportedInfo.style.color = "#ffffff";
			switch(glSupported) {
			case 2:
				unsupportedInfo.innerHTML = "Your browser does not support WebGL. Click <a href=\"" + "https://github.com/Tw1ddle/WebGL-Distance-Fields" + "\" target=\"_blank\">here for project info</a> instead.";
				break;
			case 1:
				unsupportedInfo.innerHTML = "Your browser supports WebGL, but the feature appears to be disabled. Click <a href=\"" + "https://github.com/Tw1ddle/WebGL-Distance-Fields" + "\" target=\"_blank\">here for project info</a> instead.";
				break;
			default:
				unsupportedInfo.innerHTML = "Could not detect WebGL support. Click <a href=\"" + "https://github.com/Tw1ddle/WebGL-Distance-Fields" + "\" target=\"_blank\">here for project info</a> instead.";
			}
			gameDiv.appendChild(unsupportedInfo);
			return;
		}
		this.renderer = new THREE.WebGLRenderer({ antialias : true});
		var extDerivatives = "OES_standard_derivatives";
		var ext = this.renderer.context.getExtension(extDerivatives);
		if(ext == null) {
			var missingExtensionInfo = window.document.createElement("div");
			missingExtensionInfo.style.position = "absolute";
			missingExtensionInfo.style.top = "10px";
			missingExtensionInfo.style.width = "100%";
			missingExtensionInfo.style.textAlign = "center";
			missingExtensionInfo.style.color = "#ffffff";
			missingExtensionInfo.innerHTML = "Missing required WebGL extension: " + extDerivatives + " Click <a href=\"" + "https://github.com/Tw1ddle/WebGL-Distance-Fields" + "\" target=\"_blank\">here for project info</a> instead.";
			gameDiv.appendChild(missingExtensionInfo);
			return;
		}
		this.renderer.sortObjects = false;
		this.renderer.autoClear = false;
		this.renderer.setClearColor(new THREE.Color(0));
		this.renderer.setPixelRatio(window.devicePixelRatio);
		this.gameAttachPoint = window.document.getElementById("game");
		this.gameAttachPoint.appendChild(gameDiv);
		var width = 400 * this.renderer.getPixelRatio();
		var height = 400 * this.renderer.getPixelRatio();
		this.scene = new THREE.Scene();
		this.camera = new THREE.PerspectiveCamera(75,width / height,1,10000);
		this.camera.position.z = 80;
		this.signal_windowResized.add(function() {
			var width1 = 400 * _g.renderer.getPixelRatio();
			var height1 = 400 * _g.renderer.getPixelRatio();
			_g.renderer.setSize(width1,height1);
			_g.camera.aspect = width1 / height1;
			_g.camera.updateProjectionMatrix();
		});
		this.signal_windowResized.dispatch();
		this.sdfMaker = new SDFMaker(this.renderer);
		this.sdfMaker.signal_textureLoaded.add(function(id,target) {
			if(_g.sdfMap.exists(id)) return;
			var geometry = new THREE.PlaneGeometry(target.width,target.height);
			var mesh = new THREE.Mesh(geometry);
			var aaMaterial = new THREE.ShaderMaterial({ vertexShader : shaders_EDT_$DISPLAY_$AA.vertexShader, fragmentShader : shaders_EDT_$DISPLAY_$AA.fragmentShader, uniforms : shaders_EDT_$DISPLAY_$AA.uniforms});
			aaMaterial.derivatives = true;
			aaMaterial.uniforms.tDiffuse.value = target;
			aaMaterial.uniforms.texw.value = target.width;
			aaMaterial.uniforms.texh.value = target.height;
			aaMaterial.uniforms.texLevels.value = _g.sdfMaker.texLevels;
			aaMaterial.uniforms.threshold.value = 0.0;
			_g.aaMaterials.push({ mesh : mesh, material : aaMaterial, sdf : target});
			var grayscaleMaterial = new THREE.ShaderMaterial({ vertexShader : shaders_EDT_$DISPLAY_$GRAYSCALE.vertexShader, fragmentShader : shaders_EDT_$DISPLAY_$GRAYSCALE.fragmentShader, uniforms : shaders_EDT_$DISPLAY_$GRAYSCALE.uniforms});
			grayscaleMaterial.derivatives = true;
			grayscaleMaterial.uniforms.tDiffuse.value = target;
			grayscaleMaterial.uniforms.texw.value = target.width;
			grayscaleMaterial.uniforms.texh.value = target.height;
			grayscaleMaterial.uniforms.texLevels.value = _g.sdfMaker.texLevels;
			grayscaleMaterial.uniforms.distanceFactor.value = 30.0;
			_g.grayscaleMaterials.push({ mesh : mesh, material : grayscaleMaterial, sdf : target});
			var rgbMaterial = new THREE.ShaderMaterial({ vertexShader : shaders_EDT_$DISPLAY_$RGB.vertexShader, fragmentShader : shaders_EDT_$DISPLAY_$RGB.fragmentShader, uniforms : shaders_EDT_$DISPLAY_$RGB.uniforms});
			rgbMaterial.uniforms.tDiffuse.value = target;
			rgbMaterial.uniforms.texw.value = target.width;
			rgbMaterial.uniforms.texh.value = target.height;
			rgbMaterial.uniforms.texLevels.value = _g.sdfMaker.texLevels;
			_g.rgbMaterials.push({ mesh : mesh, material : rgbMaterial, sdf : target});
			var overlayMaterial = new THREE.ShaderMaterial({ vertexShader : shaders_EDT_$DISPLAY_$OVERLAY.vertexShader, fragmentShader : shaders_EDT_$DISPLAY_$OVERLAY.fragmentShader, uniforms : shaders_EDT_$DISPLAY_$OVERLAY.uniforms});
			overlayMaterial.derivatives = true;
			overlayMaterial.uniforms.tDiffuse.value = target;
			overlayMaterial.uniforms.texw.value = target.width;
			overlayMaterial.uniforms.texh.value = target.height;
			overlayMaterial.uniforms.texLevels.value = _g.sdfMaker.texLevels;
			overlayMaterial.uniforms.threshold.value = 0.0;
			_g.overlayMaterials.push({ mesh : mesh, material : overlayMaterial, sdf : target});
			var copyMaterial = new THREE.ShaderMaterial({ vertexShader : shaders_Copy.vertexShader, fragmentShader : shaders_Copy.fragmentShader, uniforms : shaders_Copy.uniforms});
			copyMaterial.uniforms.tDiffuse.value = target;
			_g.passthroughMaterials.push({ mesh : mesh, material : copyMaterial, sdf : target});
			mesh.material = aaMaterial;
			_g.scene.add(mesh);
			mesh.position.set(0,0,0);
			_g.sdfMap.set(id,target);
		});
		this.loadTexture("assets/test2.png");
		window.addEventListener("resize",function() {
			_g.signal_windowResized.dispatch();
		},true);
		window.addEventListener("contextmenu",function(event) {
			event.preventDefault();
		},true);
		window.addEventListener("keypress",function(event1) {
			var keycode;
			if(event1.keyCode == null) keycode = event1.keyCode; else keycode = event1.charCode;
			_g.loadCanvasForKeyCode(keycode);
			event1.preventDefault();
		},true);
		this.setupStats(null);
		this.setupGUI();
		gameDiv.appendChild(this.renderer.domElement);
		window.requestAnimationFrame($bind(this,this.animate));
	}
	,getNextKeyCode: function() {
		return this.keycode++;
	}
	,loadCanvasForKeyCode: function(keycode) {
		var keyStr = String.fromCharCode(keycode);
		if(HxOverrides.indexOf(this.keyStrInput,keyStr,0) != -1) return;
		if(this.sdfMap.exists(keyStr)) return;
		this.loadCanvas(TextGenerator.generateText(keyStr),keyStr);
	}
	,loadTexture: function(url) {
		var _g = this;
		var texture1 = THREE.ImageUtils.loadTexture(url,THREE.UVMapping,function(texture) {
			_g.sdfMaker.transformTexture(texture,"",false);
		});
	}
	,loadCanvas: function(element,id) {
		var texture = new THREE.Texture(element,THREE.UVMapping);
		texture.needsUpdate = true;
		this.sdfMaker.transformTexture(texture,id,true);
	}
	,animate: function(time) {
		this.stats.begin();
		Main.dt = (time - Main.lastAnimationTime) * 0.001;
		Main.lastAnimationTime = time;
		this.renderer.render(this.scene,this.camera);
		window.requestAnimationFrame($bind(this,this.animate));
		this.stats.end();
	}
	,setupGUI: function() {
		dat_ThreeObjectGUI.addItem(this.sceneGUI,this.camera,"World Camera");
		dat_ThreeObjectGUI.addItem(this.sceneGUI,this.scene,"Scene");
		this.shaderGUI.add(this,"displayShader",this.displayShaders).listen().onChange($bind(this,this.onDisplayShaderChanged)).name("Display Shader");
		dat_ShaderGUI.generate(this.shaderGUI,"AA",shaders_EDT_$DISPLAY_$AA.uniforms);
		dat_ShaderGUI.generate(this.shaderGUI,"OVERLAY",shaders_EDT_$DISPLAY_$OVERLAY.uniforms);
		dat_ShaderGUI.generate(this.shaderGUI,"GRAYSCALE",shaders_EDT_$DISPLAY_$GRAYSCALE.uniforms);
		dat_ShaderGUI.generate(this.shaderGUI,"RGB",shaders_EDT_$DISPLAY_$RGB.uniforms);
		dat_ShaderGUI.generate(this.shaderGUI,"PASSTHROUGH",shaders_Copy.uniforms);
		dat_ShaderGUI.generate(this.shaderGUI,"SEED",shaders_EDT_$SEED.uniforms);
		dat_ShaderGUI.generate(this.shaderGUI,"FLOOD",shaders_EDT_$FLOOD.uniforms);
	}
	,onDisplayShaderChanged: function(id) {
		switch(id) {
		case "AA":
			var _g = 0;
			var _g1 = this.aaMaterials;
			while(_g < _g1.length) {
				var o = _g1[_g];
				++_g;
				o.mesh.material = o.material;
			}
			break;
		case "RGB":
			var _g2 = 0;
			var _g11 = this.rgbMaterials;
			while(_g2 < _g11.length) {
				var o1 = _g11[_g2];
				++_g2;
				o1.mesh.material = o1.material;
			}
			break;
		case "GRAYSCALE":
			var _g3 = 0;
			var _g12 = this.grayscaleMaterials;
			while(_g3 < _g12.length) {
				var o2 = _g12[_g3];
				++_g3;
				o2.mesh.material = o2.material;
			}
			break;
		case "OVERLAY":
			var _g4 = 0;
			var _g13 = this.overlayMaterials;
			while(_g4 < _g13.length) {
				var o3 = _g13[_g4];
				++_g4;
				o3.mesh.material = o3.material;
			}
			break;
		case "PASSTHROUGH":
			var _g5 = 0;
			var _g14 = this.passthroughMaterials;
			while(_g5 < _g14.length) {
				var o4 = _g14[_g5];
				++_g5;
				o4.mesh.material = o4.material;
			}
			break;
		}
	}
	,setupStats: function(mode) {
		if(mode == null) mode = 2;
		var actual = this.stats;
		var expected = null;
		if(actual != expected) throw new js__$Boot_HaxeError("FAIL: values are not equal (expected: " + Std.string(expected) + ", actual: " + Std.string(actual) + ")");
		this.stats = new Stats();
		this.stats.domElement.style.position = "absolute";
		this.stats.domElement.style.left = "0px";
		this.stats.domElement.style.top = "0px";
		window.document.body.appendChild(this.stats.domElement);
	}
	,__class__: Main
};
Math.__name__ = true;
var Reflect = function() { };
Reflect.__name__ = true;
Reflect.field = function(o,field) {
	try {
		return o[field];
	} catch( e ) {
		if (e instanceof js__$Boot_HaxeError) e = e.val;
		return null;
	}
};
Reflect.getProperty = function(o,field) {
	var tmp;
	if(o == null) return null; else if(o.__properties__ && (tmp = o.__properties__["get_" + field])) return o[tmp](); else return o[field];
};
Reflect.fields = function(o) {
	var a = [];
	if(o != null) {
		var hasOwnProperty = Object.prototype.hasOwnProperty;
		for( var f in o ) {
		if(f != "__id__" && f != "hx__closures__" && hasOwnProperty.call(o,f)) a.push(f);
		}
	}
	return a;
};
Reflect.isFunction = function(f) {
	return typeof(f) == "function" && !(f.__name__ || f.__ename__);
};
Reflect.compareMethods = function(f1,f2) {
	if(f1 == f2) return true;
	if(!Reflect.isFunction(f1) || !Reflect.isFunction(f2)) return false;
	return f1.scope == f2.scope && f1.method == f2.method && f1.method != null;
};
var SDFMaker = function(renderer) {
	this.signal_textureLoaded = new msignal_Signal2();
	this.texLevels = 256.0;
	this.renderer = renderer;
	this.scene = new THREE.Scene();
	this.scene.add(new THREE.Mesh(new THREE.PlaneGeometry(1,1)));
	this.camera = new THREE.OrthographicCamera(-0.5,0.5,0.5,-0.5,-1,1);
	this.camera.updateProjectionMatrix();
	this.blurMaterial = new THREE.ShaderMaterial({ vertexShader : shaders_GaussianBlur.vertexShader, fragmentShader : shaders_GaussianBlur.fragmentShader, uniforms : shaders_GaussianBlur.uniforms});
	this.seedMaterial = new THREE.ShaderMaterial({ vertexShader : shaders_EDT_$SEED.vertexShader, fragmentShader : shaders_EDT_$SEED.fragmentShader, uniforms : shaders_EDT_$SEED.uniforms, transparent : true});
	this.floodMaterial = new THREE.ShaderMaterial({ vertexShader : shaders_EDT_$FLOOD.vertexShader, fragmentShader : shaders_EDT_$FLOOD.fragmentShader, uniforms : shaders_EDT_$FLOOD.uniforms});
	this.copyMaterial = new THREE.ShaderMaterial({ vertexShader : shaders_Copy.vertexShader, fragmentShader : shaders_Copy.fragmentShader, uniforms : shaders_Copy.uniforms});
	this.renderTargetParams = { minFilter : THREE.NearestFilter, magFilter : THREE.NearestFilter, wrapS : THREE.ClampToEdgeWrapping, wrapT : THREE.ClampToEdgeWrapping, format : THREE.RGBAFormat, stencilBuffer : false, depthBuffer : false, type : THREE.UnsignedByteType};
};
SDFMaker.__name__ = true;
SDFMaker.prototype = {
	transformTexture: function(texture,id,blurInput) {
		if(blurInput == null) blurInput = true;
		var start = haxe_Timer.stamp();
		var width = texture.image.width;
		var height = texture.image.height;
		this.ping = new THREE.WebGLRenderTarget(width,height,this.renderTargetParams);
		this.pong = new THREE.WebGLRenderTarget(width,height,this.renderTargetParams);
		if(blurInput) {
			this.scene.overrideMaterial = this.blurMaterial;
			this.blurMaterial.uniforms.resolution.value.set(width,height);
			this.blurMaterial.uniforms.tDiffuse.value = texture;
			this.blurMaterial.uniforms.direction.value.set(1,0);
			texture.minFilter = THREE.LinearFilter;
			texture.magFilter = THREE.LinearFilter;
			texture.wrapS = THREE.RepeatWrapping;
			texture.wrapT = THREE.RepeatWrapping;
			this.renderer.render(this.scene,this.camera,this.ping,true);
			texture.wrapS = THREE.ClampToEdgeWrapping;
			texture.wrapT = THREE.ClampToEdgeWrapping;
			texture.minFilter = THREE.NearestFilter;
			texture.magFilter = THREE.NearestFilter;
			this.blurMaterial.uniforms.tDiffuse.value = this.ping;
			this.blurMaterial.uniforms.direction.value.set(0,1);
			this.ping.minFilter = THREE.LinearFilter;
			this.ping.magFilter = THREE.LinearFilter;
			this.ping.wrapS = THREE.RepeatWrapping;
			this.ping.wrapT = THREE.RepeatWrapping;
			this.renderer.render(this.scene,this.camera,this.pong,true);
			this.ping.wrapS = THREE.ClampToEdgeWrapping;
			this.ping.wrapT = THREE.ClampToEdgeWrapping;
			this.ping.minFilter = THREE.NearestFilter;
			this.ping.magFilter = THREE.NearestFilter;
		}
		this.scene.overrideMaterial = this.seedMaterial;
		if(blurInput) this.seedMaterial.uniforms.tDiffuse.value = this.pong; else this.seedMaterial.uniforms.tDiffuse.value = texture;
		this.seedMaterial.uniforms.texLevels.value = this.texLevels;
		this.renderer.render(this.scene,this.camera,this.ping,true);
		this.scene.overrideMaterial = this.floodMaterial;
		this.floodMaterial.uniforms.texLevels.value = this.texLevels;
		this.floodMaterial.uniforms.texw.value = width;
		this.floodMaterial.uniforms.texh.value = height;
		var stepSize;
		if(width > height) stepSize = width / 2 | 0; else stepSize = height / 2 | 0;
		var last = this.ping;
		while(stepSize > 0) {
			this.floodMaterial.uniforms.tDiffuse.value = last;
			this.floodMaterial.uniforms.step.value = stepSize;
			if(last == this.ping) last = this.pong; else last = this.ping;
			this.renderer.render(this.scene,this.camera,last,true);
			stepSize = stepSize / 2 | 0;
		}
		this.scene.overrideMaterial = null;
		if(last != this.ping) this.ping.dispose();
		if(last != this.pong) this.pong.dispose();
		var duration = haxe_Timer.stamp() - start;
		console.log("Transform duration: " + duration);
		this.signal_textureLoaded.dispatch(id,last);
		return last;
	}
	,__class__: SDFMaker
};
var Std = function() { };
Std.__name__ = true;
Std.string = function(s) {
	return js_Boot.__string_rec(s,"");
};
var TextGenerator = function() { };
TextGenerator.__name__ = true;
TextGenerator.generateText = function(s,width,height) {
	if(height == null) height = 512;
	if(width == null) width = 512;
	var canvas;
	var _this = window.document;
	canvas = _this.createElement("canvas");
	canvas.width = width;
	canvas.height = height;
	canvas.style.background = "black";
	var context = canvas.getContext("2d");
	context.fillStyle = "#ffffff";
	context.font = "400px Verdana";
	context.textBaseline = "middle";
	context.textAlign = "center";
	context.antialias = "subpixel";
	context.patternQuality = "best";
	context.filter = "best";
	context.imageSmoothingEnabled = true;
	context.fillText(s,canvas.width / 2,canvas.height / 2);
	canvas = TextGenerator.downScaleCanvas(canvas,0.25);
	window.document.body.appendChild(canvas);
	return canvas;
};
TextGenerator.downScaleCanvas = function(cv,scale) {
	if(scale <= 0.0 || scale >= 1.0) throw new js__$Boot_HaxeError("Scale must be a positive number < 1");
	var sqScale = scale * scale;
	var sw = cv.width;
	var sh = cv.height;
	var tw = sw * scale | 0;
	var th = sh * scale | 0;
	var sx = 0;
	var sy = 0;
	var sIndex = 0;
	var tx = 0;
	var ty = 0;
	var yIndex = 0;
	var tIndex = 0;
	var tX = 0;
	var tY = 0;
	var w = 0.0;
	var nw = 0.0;
	var wx = 0.0;
	var nwx = 0.0;
	var wy = 0.0;
	var nwy = 0.0;
	var crossX = false;
	var crossY = false;
	var sBuffer = cv.getContext("2d").getImageData(0,0,sw,sh).data;
	var tBuffer = new Float32Array(3 * tw * th);
	var sR = 0.0;
	var sG = 0.0;
	var sB = 0.0;
	while(sy < sh) {
		ty = sy * scale | 0;
		tY = ty | 0;
		yIndex = 3 * tY * tw | 0;
		crossY = tY != (ty + scale | 0);
		if(crossY) {
			wy = tY + 1 - ty;
			nwy = ty + scale - tY - 1;
		}
		sx = 0;
		while(sx < sw) {
			tx = sx * scale | 0;
			tX = tx | 0;
			tIndex = yIndex + tX * 3 | 0;
			crossX = tX != Math.floor(tx + scale);
			if(crossX) {
				wx = tX + 1 - tx;
				nwx = tx + scale - tX - 1 | 0;
			}
			sR = sBuffer[sIndex];
			sG = sBuffer[sIndex + 1];
			sB = sBuffer[sIndex + 2];
			if(!crossX && !crossY) {
				tBuffer[tIndex] += sR * sqScale;
				tBuffer[tIndex + 1] += sG * sqScale;
				tBuffer[tIndex + 2] += sB * sqScale;
			} else if(crossX && !crossY) {
				w = wx * scale;
				tBuffer[tIndex] += sR * w;
				tBuffer[tIndex + 1] += sG * w;
				tBuffer[tIndex + 2] += sB * w;
				nw = nwx * scale;
				tBuffer[tIndex + 3] += sR * nw;
				tBuffer[tIndex + 4] += sG * nw;
				tBuffer[tIndex + 5] += sB * nw;
			} else if(crossY && !crossX) {
				w = wy * scale;
				tBuffer[tIndex] += sR * w;
				tBuffer[tIndex + 1] += sG * w;
				tBuffer[tIndex + 2] += sB * w;
				nw = nwy * scale;
				tBuffer[tIndex + 3 * tw] += sR * nw;
				tBuffer[tIndex + 3 * tw + 1] += sG * nw;
				tBuffer[tIndex + 3 * tw + 2] += sB * nw;
			} else {
				w = wx * wy;
				tBuffer[tIndex] += sR * w;
				tBuffer[tIndex + 1] += sG * w;
				tBuffer[tIndex + 2] += sB * w;
				nw = nwx * wy;
				tBuffer[tIndex + 3] += sR * nw;
				tBuffer[tIndex + 4] += sG * nw;
				tBuffer[tIndex + 5] += sB * nw;
				nw = wx * nwy;
				tBuffer[tIndex + 3 * tw] += sR * nw;
				tBuffer[tIndex + 3 * tw + 1] += sG * nw;
				tBuffer[tIndex + 3 * tw + 2] += sB * nw;
				nw = nwx * nwy;
				tBuffer[tIndex + 3 * tw + 3] += sR * nw;
				tBuffer[tIndex + 3 * tw + 4] += sG * nw;
				tBuffer[tIndex + 3 * tw + 5] += sB * nw;
			}
			sIndex += 4;
			sx++;
		}
		sy++;
	}
	var result;
	var _this = window.document;
	result = _this.createElement("canvas");
	result.width = tw;
	result.height = th;
	var resultContext = result.getContext("2d");
	var resultImage = resultContext.getImageData(0,0,tw,th);
	var tByteBuffer = resultImage.data;
	var pxIndex = 0;
	sIndex = 0;
	tIndex = 0;
	while(pxIndex < tw * th) {
		tByteBuffer[tIndex] = Math.ceil(tBuffer[sIndex]);
		tByteBuffer[tIndex + 1] = Math.ceil(tBuffer[sIndex + 1]);
		tByteBuffer[tIndex + 2] = Math.ceil(tBuffer[sIndex + 2]);
		tByteBuffer[tIndex + 3] = 255;
		sIndex += 3;
		tIndex += 4;
		pxIndex++;
	}
	resultContext.putImageData(resultImage,0,0);
	return result;
};
var dat_ShaderGUI = function() { };
dat_ShaderGUI.__name__ = true;
dat_ShaderGUI.generate = function(gui,folderName,uniforms,exclude) {
	var keys = Reflect.fields(uniforms);
	var folder = gui.addFolder(folderName);
	var _g = 0;
	while(_g < keys.length) {
		var key = keys[_g];
		++_g;
		var v = Reflect.getProperty(uniforms,key);
		if(exclude != null && HxOverrides.indexOf(exclude,key,0) != -1) continue;
		var type = v.type;
		var value = v.value;
		switch(type) {
		case "f":
			if(Object.prototype.hasOwnProperty.call(v,"min") && Object.prototype.hasOwnProperty.call(v,"max")) folder.add(v,"value").listen().min(v.min).max(v.max).name(key); else folder.add(v,"value").listen().name(key);
			break;
		case "v2":
			var f = folder.addFolder(key);
			f.add(v.value,"x").listen().name(key + "_x");
			f.add(v.value,"y").listen().name(key + "_y");
			break;
		}
	}
};
var dat_ThreeObjectGUI = function() { };
dat_ThreeObjectGUI.__name__ = true;
dat_ThreeObjectGUI.addItem = function(gui,object,tag) {
	if(gui == null || object == null) return null;
	var folder = null;
	if(tag != null) folder = gui.addFolder(tag + " (" + dat_ThreeObjectGUI.guiItemCount++ + ")"); else {
		var name = Std.string(Reflect.field(object,"name"));
		if(name == null || name.length == 0) folder = gui.addFolder("Item (" + dat_ThreeObjectGUI.guiItemCount++ + ")"); else folder = gui.addFolder(Std.string(Reflect.getProperty(object,"name")) + " (" + dat_ThreeObjectGUI.guiItemCount++ + ")");
	}
	if(js_Boot.__instanceof(object,THREE.Scene)) {
		var scene = object;
		var _g = 0;
		var _g1 = scene.children;
		while(_g < _g1.length) {
			var object1 = _g1[_g];
			++_g;
			dat_ThreeObjectGUI.addItem(gui,object1);
		}
	}
	if(js_Boot.__instanceof(object,THREE.Object3D)) {
		var object3d = object;
		folder.add(object3d.position,"x",-5000.0,5000.0,2).listen();
		folder.add(object3d.position,"y",-5000.0,5000.0,2).listen();
		folder.add(object3d.position,"z",-20000.0,20000.0,2).listen();
		folder.add(object3d.rotation,"x",-Math.PI * 2,Math.PI * 2,0.01).listen();
		folder.add(object3d.rotation,"y",-Math.PI * 2,Math.PI * 2,0.01).listen();
		folder.add(object3d.rotation,"z",-Math.PI * 2,Math.PI * 2,0.01).listen();
		folder.add(object3d.scale,"x",0.0,10.0,0.01).listen();
		folder.add(object3d.scale,"y",0.0,10.0,0.01).listen();
		folder.add(object3d.scale,"z",0.0,10.0,0.01).listen();
	}
	if(js_Boot.__instanceof(object,THREE.PointLight)) {
		var light = object;
		folder.add(light,"intensity",0,3,0.01).listen();
	}
	return folder;
};
var haxe_IMap = function() { };
haxe_IMap.__name__ = true;
var haxe_Timer = function() { };
haxe_Timer.__name__ = true;
haxe_Timer.stamp = function() {
	return new Date().getTime() / 1000;
};
var haxe_ds_StringMap = function() {
	this.h = { };
};
haxe_ds_StringMap.__name__ = true;
haxe_ds_StringMap.__interfaces__ = [haxe_IMap];
haxe_ds_StringMap.prototype = {
	set: function(key,value) {
		if(__map_reserved[key] != null) this.setReserved(key,value); else this.h[key] = value;
	}
	,exists: function(key) {
		if(__map_reserved[key] != null) return this.existsReserved(key);
		return this.h.hasOwnProperty(key);
	}
	,setReserved: function(key,value) {
		if(this.rh == null) this.rh = { };
		this.rh["$" + key] = value;
	}
	,existsReserved: function(key) {
		if(this.rh == null) return false;
		return this.rh.hasOwnProperty("$" + key);
	}
	,__class__: haxe_ds_StringMap
};
var js__$Boot_HaxeError = function(val) {
	Error.call(this);
	this.val = val;
	this.message = String(val);
	if(Error.captureStackTrace) Error.captureStackTrace(this,js__$Boot_HaxeError);
};
js__$Boot_HaxeError.__name__ = true;
js__$Boot_HaxeError.__super__ = Error;
js__$Boot_HaxeError.prototype = $extend(Error.prototype,{
	__class__: js__$Boot_HaxeError
});
var js_Boot = function() { };
js_Boot.__name__ = true;
js_Boot.getClass = function(o) {
	if((o instanceof Array) && o.__enum__ == null) return Array; else {
		var cl = o.__class__;
		if(cl != null) return cl;
		var name = js_Boot.__nativeClassName(o);
		if(name != null) return js_Boot.__resolveNativeClass(name);
		return null;
	}
};
js_Boot.__string_rec = function(o,s) {
	if(o == null) return "null";
	if(s.length >= 5) return "<...>";
	var t = typeof(o);
	if(t == "function" && (o.__name__ || o.__ename__)) t = "object";
	switch(t) {
	case "object":
		if(o instanceof Array) {
			if(o.__enum__) {
				if(o.length == 2) return o[0];
				var str2 = o[0] + "(";
				s += "\t";
				var _g1 = 2;
				var _g = o.length;
				while(_g1 < _g) {
					var i1 = _g1++;
					if(i1 != 2) str2 += "," + js_Boot.__string_rec(o[i1],s); else str2 += js_Boot.__string_rec(o[i1],s);
				}
				return str2 + ")";
			}
			var l = o.length;
			var i;
			var str1 = "[";
			s += "\t";
			var _g2 = 0;
			while(_g2 < l) {
				var i2 = _g2++;
				str1 += (i2 > 0?",":"") + js_Boot.__string_rec(o[i2],s);
			}
			str1 += "]";
			return str1;
		}
		var tostr;
		try {
			tostr = o.toString;
		} catch( e ) {
			if (e instanceof js__$Boot_HaxeError) e = e.val;
			return "???";
		}
		if(tostr != null && tostr != Object.toString && typeof(tostr) == "function") {
			var s2 = o.toString();
			if(s2 != "[object Object]") return s2;
		}
		var k = null;
		var str = "{\n";
		s += "\t";
		var hasp = o.hasOwnProperty != null;
		for( var k in o ) {
		if(hasp && !o.hasOwnProperty(k)) {
			continue;
		}
		if(k == "prototype" || k == "__class__" || k == "__super__" || k == "__interfaces__" || k == "__properties__") {
			continue;
		}
		if(str.length != 2) str += ", \n";
		str += s + k + " : " + js_Boot.__string_rec(o[k],s);
		}
		s = s.substring(1);
		str += "\n" + s + "}";
		return str;
	case "function":
		return "<function>";
	case "string":
		return o;
	default:
		return String(o);
	}
};
js_Boot.__interfLoop = function(cc,cl) {
	if(cc == null) return false;
	if(cc == cl) return true;
	var intf = cc.__interfaces__;
	if(intf != null) {
		var _g1 = 0;
		var _g = intf.length;
		while(_g1 < _g) {
			var i = _g1++;
			var i1 = intf[i];
			if(i1 == cl || js_Boot.__interfLoop(i1,cl)) return true;
		}
	}
	return js_Boot.__interfLoop(cc.__super__,cl);
};
js_Boot.__instanceof = function(o,cl) {
	if(cl == null) return false;
	switch(cl) {
	case Int:
		return (o|0) === o;
	case Float:
		return typeof(o) == "number";
	case Bool:
		return typeof(o) == "boolean";
	case String:
		return typeof(o) == "string";
	case Array:
		return (o instanceof Array) && o.__enum__ == null;
	case Dynamic:
		return true;
	default:
		if(o != null) {
			if(typeof(cl) == "function") {
				if(o instanceof cl) return true;
				if(js_Boot.__interfLoop(js_Boot.getClass(o),cl)) return true;
			} else if(typeof(cl) == "object" && js_Boot.__isNativeObj(cl)) {
				if(o instanceof cl) return true;
			}
		} else return false;
		if(cl == Class && o.__name__ != null) return true;
		if(cl == Enum && o.__ename__ != null) return true;
		return o.__enum__ == cl;
	}
};
js_Boot.__nativeClassName = function(o) {
	var name = js_Boot.__toStr.call(o).slice(8,-1);
	if(name == "Object" || name == "Function" || name == "Math" || name == "JSON") return null;
	return name;
};
js_Boot.__isNativeObj = function(o) {
	return js_Boot.__nativeClassName(o) != null;
};
js_Boot.__resolveNativeClass = function(name) {
	return $global[name];
};
var msignal_Signal = function(valueClasses) {
	if(valueClasses == null) valueClasses = [];
	this.valueClasses = valueClasses;
	this.slots = msignal_SlotList.NIL;
	this.priorityBased = false;
};
msignal_Signal.__name__ = true;
msignal_Signal.prototype = {
	add: function(listener) {
		return this.registerListener(listener);
	}
	,addOnce: function(listener) {
		return this.registerListener(listener,true);
	}
	,addWithPriority: function(listener,priority) {
		if(priority == null) priority = 0;
		return this.registerListener(listener,false,priority);
	}
	,addOnceWithPriority: function(listener,priority) {
		if(priority == null) priority = 0;
		return this.registerListener(listener,true,priority);
	}
	,remove: function(listener) {
		var slot = this.slots.find(listener);
		if(slot == null) return null;
		this.slots = this.slots.filterNot(listener);
		return slot;
	}
	,removeAll: function() {
		this.slots = msignal_SlotList.NIL;
	}
	,registerListener: function(listener,once,priority) {
		if(priority == null) priority = 0;
		if(once == null) once = false;
		if(this.registrationPossible(listener,once)) {
			var newSlot = this.createSlot(listener,once,priority);
			if(!this.priorityBased && priority != 0) this.priorityBased = true;
			if(!this.priorityBased && priority == 0) this.slots = this.slots.prepend(newSlot); else this.slots = this.slots.insertWithPriority(newSlot);
			return newSlot;
		}
		return this.slots.find(listener);
	}
	,registrationPossible: function(listener,once) {
		if(!this.slots.nonEmpty) return true;
		var existingSlot = this.slots.find(listener);
		if(existingSlot == null) return true;
		if(existingSlot.once != once) throw new js__$Boot_HaxeError("You cannot addOnce() then add() the same listener without removing the relationship first.");
		return false;
	}
	,createSlot: function(listener,once,priority) {
		if(priority == null) priority = 0;
		if(once == null) once = false;
		return null;
	}
	,get_numListeners: function() {
		return this.slots.get_length();
	}
	,__class__: msignal_Signal
	,__properties__: {get_numListeners:"get_numListeners"}
};
var msignal_Signal0 = function() {
	msignal_Signal.call(this);
};
msignal_Signal0.__name__ = true;
msignal_Signal0.__super__ = msignal_Signal;
msignal_Signal0.prototype = $extend(msignal_Signal.prototype,{
	dispatch: function() {
		var slotsToProcess = this.slots;
		while(slotsToProcess.nonEmpty) {
			slotsToProcess.head.execute();
			slotsToProcess = slotsToProcess.tail;
		}
	}
	,createSlot: function(listener,once,priority) {
		if(priority == null) priority = 0;
		if(once == null) once = false;
		return new msignal_Slot0(this,listener,once,priority);
	}
	,__class__: msignal_Signal0
});
var msignal_Signal1 = function(type) {
	msignal_Signal.call(this,[type]);
};
msignal_Signal1.__name__ = true;
msignal_Signal1.__super__ = msignal_Signal;
msignal_Signal1.prototype = $extend(msignal_Signal.prototype,{
	dispatch: function(value) {
		var slotsToProcess = this.slots;
		while(slotsToProcess.nonEmpty) {
			slotsToProcess.head.execute(value);
			slotsToProcess = slotsToProcess.tail;
		}
	}
	,createSlot: function(listener,once,priority) {
		if(priority == null) priority = 0;
		if(once == null) once = false;
		return new msignal_Slot1(this,listener,once,priority);
	}
	,__class__: msignal_Signal1
});
var msignal_Signal2 = function(type1,type2) {
	msignal_Signal.call(this,[type1,type2]);
};
msignal_Signal2.__name__ = true;
msignal_Signal2.__super__ = msignal_Signal;
msignal_Signal2.prototype = $extend(msignal_Signal.prototype,{
	dispatch: function(value1,value2) {
		var slotsToProcess = this.slots;
		while(slotsToProcess.nonEmpty) {
			slotsToProcess.head.execute(value1,value2);
			slotsToProcess = slotsToProcess.tail;
		}
	}
	,createSlot: function(listener,once,priority) {
		if(priority == null) priority = 0;
		if(once == null) once = false;
		return new msignal_Slot2(this,listener,once,priority);
	}
	,__class__: msignal_Signal2
});
var msignal_Slot = function(signal,listener,once,priority) {
	if(priority == null) priority = 0;
	if(once == null) once = false;
	this.signal = signal;
	this.set_listener(listener);
	this.once = once;
	this.priority = priority;
	this.enabled = true;
};
msignal_Slot.__name__ = true;
msignal_Slot.prototype = {
	remove: function() {
		this.signal.remove(this.listener);
	}
	,set_listener: function(value) {
		if(value == null) throw new js__$Boot_HaxeError("listener cannot be null");
		return this.listener = value;
	}
	,__class__: msignal_Slot
	,__properties__: {set_listener:"set_listener"}
};
var msignal_Slot0 = function(signal,listener,once,priority) {
	if(priority == null) priority = 0;
	if(once == null) once = false;
	msignal_Slot.call(this,signal,listener,once,priority);
};
msignal_Slot0.__name__ = true;
msignal_Slot0.__super__ = msignal_Slot;
msignal_Slot0.prototype = $extend(msignal_Slot.prototype,{
	execute: function() {
		if(!this.enabled) return;
		if(this.once) this.remove();
		this.listener();
	}
	,__class__: msignal_Slot0
});
var msignal_Slot1 = function(signal,listener,once,priority) {
	if(priority == null) priority = 0;
	if(once == null) once = false;
	msignal_Slot.call(this,signal,listener,once,priority);
};
msignal_Slot1.__name__ = true;
msignal_Slot1.__super__ = msignal_Slot;
msignal_Slot1.prototype = $extend(msignal_Slot.prototype,{
	execute: function(value1) {
		if(!this.enabled) return;
		if(this.once) this.remove();
		if(this.param != null) value1 = this.param;
		this.listener(value1);
	}
	,__class__: msignal_Slot1
});
var msignal_Slot2 = function(signal,listener,once,priority) {
	if(priority == null) priority = 0;
	if(once == null) once = false;
	msignal_Slot.call(this,signal,listener,once,priority);
};
msignal_Slot2.__name__ = true;
msignal_Slot2.__super__ = msignal_Slot;
msignal_Slot2.prototype = $extend(msignal_Slot.prototype,{
	execute: function(value1,value2) {
		if(!this.enabled) return;
		if(this.once) this.remove();
		if(this.param1 != null) value1 = this.param1;
		if(this.param2 != null) value2 = this.param2;
		this.listener(value1,value2);
	}
	,__class__: msignal_Slot2
});
var msignal_SlotList = function(head,tail) {
	this.nonEmpty = false;
	if(head == null && tail == null) {
		if(msignal_SlotList.NIL != null) throw new js__$Boot_HaxeError("Parameters head and tail are null. Use the NIL element instead.");
		this.nonEmpty = false;
	} else if(head == null) throw new js__$Boot_HaxeError("Parameter head cannot be null."); else {
		this.head = head;
		if(tail == null) this.tail = msignal_SlotList.NIL; else this.tail = tail;
		this.nonEmpty = true;
	}
};
msignal_SlotList.__name__ = true;
msignal_SlotList.prototype = {
	get_length: function() {
		if(!this.nonEmpty) return 0;
		if(this.tail == msignal_SlotList.NIL) return 1;
		var result = 0;
		var p = this;
		while(p.nonEmpty) {
			++result;
			p = p.tail;
		}
		return result;
	}
	,prepend: function(slot) {
		return new msignal_SlotList(slot,this);
	}
	,append: function(slot) {
		if(slot == null) return this;
		if(!this.nonEmpty) return new msignal_SlotList(slot);
		if(this.tail == msignal_SlotList.NIL) return new msignal_SlotList(slot).prepend(this.head);
		var wholeClone = new msignal_SlotList(this.head);
		var subClone = wholeClone;
		var current = this.tail;
		while(current.nonEmpty) {
			subClone = subClone.tail = new msignal_SlotList(current.head);
			current = current.tail;
		}
		subClone.tail = new msignal_SlotList(slot);
		return wholeClone;
	}
	,insertWithPriority: function(slot) {
		if(!this.nonEmpty) return new msignal_SlotList(slot);
		var priority = slot.priority;
		if(priority >= this.head.priority) return this.prepend(slot);
		var wholeClone = new msignal_SlotList(this.head);
		var subClone = wholeClone;
		var current = this.tail;
		while(current.nonEmpty) {
			if(priority > current.head.priority) {
				subClone.tail = current.prepend(slot);
				return wholeClone;
			}
			subClone = subClone.tail = new msignal_SlotList(current.head);
			current = current.tail;
		}
		subClone.tail = new msignal_SlotList(slot);
		return wholeClone;
	}
	,filterNot: function(listener) {
		if(!this.nonEmpty || listener == null) return this;
		if(Reflect.compareMethods(this.head.listener,listener)) return this.tail;
		var wholeClone = new msignal_SlotList(this.head);
		var subClone = wholeClone;
		var current = this.tail;
		while(current.nonEmpty) {
			if(Reflect.compareMethods(current.head.listener,listener)) {
				subClone.tail = current.tail;
				return wholeClone;
			}
			subClone = subClone.tail = new msignal_SlotList(current.head);
			current = current.tail;
		}
		return this;
	}
	,contains: function(listener) {
		if(!this.nonEmpty) return false;
		var p = this;
		while(p.nonEmpty) {
			if(Reflect.compareMethods(p.head.listener,listener)) return true;
			p = p.tail;
		}
		return false;
	}
	,find: function(listener) {
		if(!this.nonEmpty) return null;
		var p = this;
		while(p.nonEmpty) {
			if(Reflect.compareMethods(p.head.listener,listener)) return p.head;
			p = p.tail;
		}
		return null;
	}
	,__class__: msignal_SlotList
	,__properties__: {get_length:"get_length"}
};
var shaders_Copy = function() { };
shaders_Copy.__name__ = true;
var shaders_EDT_$FLOOD = function() { };
shaders_EDT_$FLOOD.__name__ = true;
var shaders_EDT_$SEED = function() { };
shaders_EDT_$SEED.__name__ = true;
var shaders_EDT_$DISPLAY_$AA = function() { };
shaders_EDT_$DISPLAY_$AA.__name__ = true;
var shaders_EDT_$DISPLAY_$OVERLAY = function() { };
shaders_EDT_$DISPLAY_$OVERLAY.__name__ = true;
var shaders_EDT_$DISPLAY_$RGB = function() { };
shaders_EDT_$DISPLAY_$RGB.__name__ = true;
var shaders_EDT_$DISPLAY_$GRAYSCALE = function() { };
shaders_EDT_$DISPLAY_$GRAYSCALE.__name__ = true;
var shaders_EDT_$DISPLAY_$ALPHA_$THRESHOLD = function() { };
shaders_EDT_$DISPLAY_$ALPHA_$THRESHOLD.__name__ = true;
var shaders_GaussianBlur = function() { };
shaders_GaussianBlur.__name__ = true;
var util_FileReader = function() { };
util_FileReader.__name__ = true;
var $_, $fid = 0;
function $bind(o,m) { if( m == null ) return null; if( m.__id__ == null ) m.__id__ = $fid++; var f; if( o.hx__closures__ == null ) o.hx__closures__ = {}; else f = o.hx__closures__[m.__id__]; if( f == null ) { f = function(){ return f.method.apply(f.scope, arguments); }; f.scope = o; f.method = m; o.hx__closures__[m.__id__] = f; } return f; }
if(Array.prototype.indexOf) HxOverrides.indexOf = function(a,o,i) {
	return Array.prototype.indexOf.call(a,o,i);
};
String.prototype.__class__ = String;
String.__name__ = true;
Array.__name__ = true;
Date.prototype.__class__ = Date;
Date.__name__ = ["Date"];
var Int = { __name__ : ["Int"]};
var Dynamic = { __name__ : ["Dynamic"]};
var Float = Number;
Float.__name__ = ["Float"];
var Bool = Boolean;
Bool.__ename__ = ["Bool"];
var Class = { __name__ : ["Class"]};
var Enum = { };
var __map_reserved = {}
msignal_SlotList.NIL = new msignal_SlotList(null,null);
Main.REPO_URL = "https://github.com/Tw1ddle/WebGL-Distance-Fields";
Main.WEBSITE_URL = "http://samcodes.co.uk/";
Main.TWITTER_URL = "https://twitter.com/Sam_Twidale";
Main.HAXE_URL = "http://haxe.org/";
Main.lastAnimationTime = 0.0;
Main.dt = 0.0;
dat_ThreeObjectGUI.guiItemCount = 0;
js_Boot.__toStr = {}.toString;
shaders_Copy.uniforms = { tDiffuse : { type : "t", value : null}};
shaders_Copy.vertexShader = "varying vec2 vUv;\r\n\r\nvoid main()\r\n{\r\n\tvUv = uv;\r\n\tgl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);\r\n}";
shaders_Copy.fragmentShader = "varying vec2 vUv;\r\n\r\nuniform sampler2D tDiffuse;\r\n\r\nvoid main()\r\n{\r\n\tgl_FragColor = texture2D(tDiffuse, vUv);\r\n}";
shaders_EDT_$FLOOD.uniforms = { tDiffuse : { type : "t", value : null}, texLevels : { type : "f", value : 0.0}, texw : { type : "f", value : 0.0}, texh : { type : "f", value : 0.0}, step : { type : "f", value : 0.0}};
shaders_EDT_$FLOOD.vertexShader = "// Jump flooding algorithm for Euclidean distance transform, according to Danielsson (1980) and Guodong Rong (2007).\r\n// This code represents one iteration of the flood filling.\r\n// You need to run it multiple times with different step lengths to perform a full distance transformation.\r\n\r\n// Adapted for three.js demo by Sam Twidale.\r\n// Original implementation by Stefan Gustavson 2010.\r\n// This code is in the public domain.\r\n\r\nvarying vec2 vUv;\r\nvarying float stepu;\r\nvarying float stepv;\r\n\r\nuniform float step;\r\nuniform float texw;\r\nuniform float texh;\r\n\r\nvoid main()\r\n{\r\n\t// Saves a division in the fragment shader\r\n\tstepu = step / texw;\r\n\tstepv = step / texh;\r\n\t\r\n\tvUv = uv;\t\r\n\tgl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);\r\n}";
shaders_EDT_$FLOOD.fragmentShader = "// Jump flooding algorithm for Euclidean distance transform, according to Danielsson (1980) and Guodong Rong (2007).\r\n// This code represents one iteration of the flood filling.\r\n// You need to run it multiple times with different step lengths to perform a full distance transformation.\r\n\r\n// Adapted for three.js demo by Sam Twidale.\r\n// Original implementation by Stefan Gustavson 2010.\r\n// This code is in the public domain.\r\n\r\nvarying vec2 vUv;\r\nvarying float stepu;\r\nvarying float stepv;\r\n\r\nuniform sampler2D tDiffuse;\r\nuniform float texw;\r\nuniform float texh;\r\nuniform float texLevels;\r\n\r\n// Helper function to remap unsigned normalized floats [0.0..1.0]\r\n// coming from a texture stored in integer format internally to a\r\n// signed float vector pointing exactly to a pixel centre in texture\r\n// space. The range of valid vectors is\r\n// [-1.0+0.5/texsize, 1.0-0.5/texsize], with the special value\r\n// -1.0-0.5*texsize (represented as integer 0) meaning\r\n// \"distance vector still undetermined\".\r\n// The mapping is carefully designed to map both 8 bit and 16\r\n// bit integer texture data to distinct and exact floating point\r\n// texture coordinate offsets and vice versa.\r\n// 8 bit integer textures can be used to transform images up to\r\n// size 128x128 pixels, and 16 bit integer textures can be used to\r\n// transform images up to 32768x32768, i.e. beyond the largest\r\n// texture size available in current implementations of OpenGL.\r\n// Direct use of integers in the shader (by means of texture2DRect\r\n// and GL_RG8I and GL_RG16I texture formats) could be faster, but-1\r\n// this code is conveniently compatible even with version 1.2 of GLSL\r\n// (i.e. OpenGL 2.1), and the main shader is limited by texture access\r\n// and branching, not ALU capacity, so a few extra multiplications\r\n// for indexing and output storage are not that bad.\r\nvec2 remap(vec2 floatdata)\r\n{\r\n     return floatdata * (texLevels - 1.0) / texLevels * 2.0 - 1.0;\r\n}\r\n\r\nvec2 remap_inv(vec2 floatvec)\r\n{\r\n     return (floatvec + 1.0) * 0.5 * texLevels / (texLevels - 1.0);\r\n}\r\n\r\n// TODO this isn't ideal, also will it work for most texture sizes?\r\nvec3 sampleTexture(sampler2D texture, vec2 vec)\r\n{\r\n\t// The algorithm depends on the texture having a CLAMP_TO_BORDER attribute and a border color with R = 0.\r\n\t// These explicit conditionals to avoid propagating incorrect vectors when looking outside of [0,1] in UV cause a slowdown of about 25%.\r\n\tif(vec.x >= 1.0 || vec.y >= 1.0 || vec.x <= 0.0 || vec.y <= 0.0)\r\n\t{\r\n\t\tvec = clamp(vec, 0.0, 1.0);\r\n\t\treturn vec3(0.0, 0.0, 0.0);\r\n\t}\r\n\t\r\n\treturn texture2D(texture, vec).rgb;\r\n}\r\n\r\nvoid testCandidate(in vec2 stepvec, inout vec4 bestseed)\r\n{\r\n\tvec2 newvec = vUv + stepvec; // Absolute position of that candidate\r\n\tvec3 texel = sampleTexture(tDiffuse, newvec).rgb;\r\n\tvec4 newseed; // Closest point from that candidate (xy), its AA distance (z) and its grayscale value (w)\r\n\tnewseed.xy = remap(texel.rg);\r\n\tif(newseed.x > -0.99999) // If the new seed is not \"indeterminate distance\"\r\n\t{\r\n\t\tnewseed.xy = newseed.xy + stepvec;\r\n\t\t\r\n\t\t// TODO: implement better equations for calculating the AA distance\r\n\t\t// Try by getting the direction of the edge using the gradients of nearby edge pixels \r\n\t\t\r\n\t\tfloat di = length(newseed.xy);\r\n\t\tfloat df = texel.b - 0.5;\r\n\t\t\r\n\t\t// TODO: This AA assumes texw == texh. It does not allow for non-square textures.\r\n\t\tnewseed.z = di + (df / texw);\r\n\t\tnewseed.w = texel.b;\r\n\t\t\r\n\t\tif(newseed.z < bestseed.z)\r\n\t\t{\r\n\t\t\tbestseed = newseed;\r\n\t\t}\r\n\t}\r\n}\r\n\r\nvoid main()\r\n{\r\n\t// Searches for better distance vectors among 8 candidates\r\n\tvec3 texel = sampleTexture(tDiffuse, vUv).rgb;\r\n\t\r\n\t// Closest seed so far\r\n\tvec4 bestseed;\r\n\tbestseed.xy = remap(texel.rg);\r\n\tbestseed.z = length(bestseed.xy) + (texel.b - 0.5) / texw; // Add AA edge offset to distance\r\n\tbestseed.w = texel.b; // Save AA/grayscale value\r\n\t\r\n\ttestCandidate(vec2(-stepu, -stepv), bestseed);\r\n\ttestCandidate(vec2(-stepu, 0.0), bestseed);\r\n\ttestCandidate(vec2(-stepu, stepv), bestseed);\r\n\ttestCandidate(vec2(0.0, -stepv), bestseed);\r\n\ttestCandidate(vec2(0.0, stepv), bestseed);\r\n\ttestCandidate(vec2(stepu, -stepv), bestseed);\r\n\ttestCandidate(vec2(stepu, 0.0), bestseed);\r\n\ttestCandidate(vec2(stepu, stepv), bestseed);\r\n\t\r\n\tgl_FragColor = vec4(remap_inv(bestseed.xy), bestseed.w, 1.0);\r\n}";
shaders_EDT_$SEED.uniforms = { tDiffuse : { type : "t", value : null}, texLevels : { type : "f", value : 0.0}};
shaders_EDT_$SEED.vertexShader = "varying vec2 vUv;\r\n\r\nvoid main()\r\n{\r\n\tvUv = uv;\r\n\tgl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);\r\n}";
shaders_EDT_$SEED.fragmentShader = "// Jump flooding algorithm for Euclidean distance transform, according to Danielsson (1980) and Guodong Rong (2007).\r\n// This shader initializes the distance field in preparation for the flood filling.\r\n\r\n// Adapted for three.js demo by Sam Twidale.\r\n// Original implementation by Stefan Gustavson 2010.\r\n// This code is in the public domain.\r\n\r\nvarying vec2 vUv;\r\n\r\nuniform sampler2D tDiffuse;\r\nuniform float texLevels;\r\n\r\nvoid main()\r\n{\r\n\tfloat texel = texture2D(tDiffuse, vUv).r;\r\n\t\r\n\t// Represents zero\r\n\tfloat myzero = 0.5 * texLevels / (texLevels - 1.0);\r\n\t\r\n\t// Represents infinity/not-yet-calculated\r\n\tfloat myinfinity = 0.0;\r\n\t\r\n\t// Sub-pixel AA distance\r\n\tfloat aadist = texel;\r\n\t\r\n\t// Pixels > 0.5 are objects, others are background\r\n\tgl_FragColor = vec4(vec2(texel > 0.99999 ? myinfinity : myzero), aadist, 1.0);\r\n}";
shaders_EDT_$DISPLAY_$AA.uniforms = { tDiffuse : { type : "t", value : null}, texw : { type : "f", value : 0.0}, texh : { type : "f", value : 0.0}, texLevels : { type : "f", value : 0.0}, threshold : { type : "f", value : 0.0, min : 0.0, max : 1.0}};
shaders_EDT_$DISPLAY_$AA.vertexShader = "// Adapted for three.js demo by Sam Twidale.\r\n// Original implementation by Stefan Gustavson 2010.\r\n// This code is in the public domain.\r\n\r\nvarying vec2 vUv;\r\nvarying float oneu;\r\nvarying float onev;\r\n\r\nuniform float texw;\r\nuniform float texh;\r\n\r\nvoid main()\r\n{\r\n\tvUv = uv;\r\n\t\r\n\t// Save divisions in some of the fragment shaders\r\n\toneu = 1.0 / texw;\r\n\tonev = 1.0 / texh;\r\n\t\r\n\tgl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);\r\n}";
shaders_EDT_$DISPLAY_$AA.fragmentShader = "// Distance map contour texturing.\r\n// A reimplementation of Greens method, with a 16-bit 8:8 distance map and explicit bilinear interpolation.\r\n\r\n// Adapted for three.js demo by Sam Twidale.\r\n// Original implementation by Stefan Gustavson 2011.\r\n// This code is in the public domain.\r\n\r\nvarying vec2 vUv;\r\nvarying float oneu;\r\nvarying float onev;\r\n\r\nuniform sampler2D tDiffuse;\r\nuniform float texw;\r\nuniform float texh;\r\nuniform float texLevels;\r\nuniform float threshold;\r\n\r\n// Replacement for RSLs filterstep(), with fwidth() done right.\r\n// threshold is constant, value is smoothly varying\r\nfloat aastep(float threshold, float value)\r\n{\r\n\tfloat afwidth = 0.7 * length(vec2(dFdx(value), dFdy(value)));\r\n\treturn smoothstep(threshold - afwidth, threshold + afwidth, value); // GLSLs fwidth(value) is abs(dFdx(value)) + abs(dFdy(value))\r\n}\r\n\r\n// Helper functions to remap unsigned normalized floats [0.0, 1.0] coming from an integer texture to the range we need [-1, 1].\r\n// The transformations are very specifically designed to map integer texel values exactly to pixel centers, and vice versa.\r\nvec2 remap(vec2 floatdata)\r\n{\r\n\treturn floatdata * (texLevels - 1.0) / texLevels * 2.0 - 1.0;\r\n}\r\n\r\nvoid main()\r\n{\r\n\t// Scale texcoords to range ([0, texw], [0, texh])\r\n\tvec2 uv = vUv * vec2(texw, texh);\r\n\t\r\n\t// Compute texel-local (u,v) coordinates for the four closest texels\r\n\tvec2 uv00 = floor(uv - vec2(0.5)); // Lower left corner of lower left texel\r\n\tvec2 uvlerp = uv - uv00 - vec2(0.5); // Texel-local lerp blends [0,1]\r\n\t\r\n\t// Center st00 on lower left texel and rescale to [0,1] for texture lookup\r\n\tvec2 st00 = (uv00 + vec2(0.5)) * vec2(oneu, onev);\r\n\t\r\n\t// Compute distance value from four closest 8-bit RGBA texels\r\n\tvec4 T00 = texture2D(tDiffuse, st00);\r\n\tvec4 T10 = texture2D(tDiffuse, st00 + vec2(oneu, 0.0));\r\n\tvec4 T01 = texture2D(tDiffuse, st00 + vec2(0.0, onev));\r\n\tvec4 T11 = texture2D(tDiffuse, st00 + vec2(oneu, onev));\r\n\tfloat D00 = length(remap(T00.rg)) + (T00.b - 0.5) / texw;\r\n\tfloat D10 = length(remap(T10.rg)) + (T10.b - 0.5) / texw;\r\n\tfloat D01 = length(remap(T01.rg)) + (T01.b - 0.5) / texw;\r\n\tfloat D11 = length(remap(T11.rg)) + (T11.b - 0.5) / texw;\r\n\t\r\n\t// Interpolate along v\r\n\tvec2 D0_1 = mix(vec2(D00, D10), vec2(D01, D11), uvlerp.y);\r\n\t\r\n\t// Interpolate along u\r\n\tfloat D = mix(D0_1.x, D0_1.y, uvlerp.x);\r\n\t\r\n\tfloat g = aastep(threshold, D);\r\n\t\r\n\t// Final fragment color\r\n\tgl_FragColor = vec4(vec3(g), 1.0);\r\n}";
shaders_EDT_$DISPLAY_$OVERLAY.uniforms = { tDiffuse : { type : "t", value : null}, texw : { type : "f", value : 0.0}, texh : { type : "f", value : 0.0}, texLevels : { type : "f", value : 0.0}, threshold : { type : "f", value : 0.0, min : 0.0, max : 1.0}};
shaders_EDT_$DISPLAY_$OVERLAY.vertexShader = "// Adapted for three.js demo by Sam Twidale.\r\n// Original implementation by Stefan Gustavson 2010.\r\n// This code is in the public domain.\r\n\r\nvarying vec2 vUv;\r\nvarying float oneu;\r\nvarying float onev;\r\n\r\nuniform float texw;\r\nuniform float texh;\r\n\r\nvoid main()\r\n{\r\n\tvUv = uv;\r\n\t\r\n\t// Save divisions in some of the fragment shaders\r\n\toneu = 1.0 / texw;\r\n\tonev = 1.0 / texh;\r\n\t\r\n\tgl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);\r\n}";
shaders_EDT_$DISPLAY_$OVERLAY.fragmentShader = "// Distance map contour texturing.\r\n// A reimplementation of Greens method, with a 16-bit 8:8 distance map and explicit bilinear interpolation.\r\n\r\n// Adapted for three.js demo by Sam Twidale.\r\n// Original implementation by Stefan Gustavson 2011.\r\n// This code is in the public domain.\r\n\r\nvarying vec2 vUv;\r\nvarying float oneu;\r\nvarying float onev;\r\n\r\nuniform sampler2D tDiffuse;\r\nuniform float texw;\r\nuniform float texh;\r\nuniform float texLevels;\r\nuniform float threshold;\r\n\r\n// Replacement for RSLs filterstep(), with fwidth() done right.\r\n// threshold is constant, value is smoothly varying\r\nfloat aastep(float threshold, float value)\r\n{\r\n\tfloat afwidth = 0.7 * length(vec2(dFdx(value), dFdy(value)));\r\n\treturn smoothstep(threshold - afwidth, threshold + afwidth, value); // GLSLs fwidth(value) is abs(dFdx(value)) + abs(dFdy(value))\r\n}\r\n\r\n// Helper functions to remap unsigned normalized floats [0.0, 1.0] coming from an integer texture to the range we need [-1, 1].\r\n// The transformations are very specifically designed to map integer texel values exactly to pixel centers, and vice versa.\r\nvec2 remap(vec2 floatdata)\r\n{\r\n\treturn floatdata * (texLevels - 1.0) / texLevels * 2.0 - 1.0;\r\n}\r\n\r\nvoid main()\r\n{\r\n\t// Scale texcoords to range ([0, texw], [0, texh])\r\n\tvec2 uv = vUv * vec2(texw, texh);\r\n\t\r\n\t// Compute texel-local (u,v) coordinates for the four closest texels\r\n\tvec2 uv00 = floor(uv - vec2(0.5)); // Lower left corner of lower left texel\r\n\tvec2 uvlerp = uv - uv00 - vec2(0.5); // Texel-local lerp blends [0,1]\r\n\t\r\n\t// Center st00 on lower left texel and rescale to [0,1] for texture lookup\r\n\tvec2 st00 = (uv00 + vec2(0.5)) * vec2(oneu, onev);\r\n\t\r\n\t// Compute distance value from four closest 8-bit RGBA texels\r\n\tvec4 T00 = texture2D(tDiffuse, st00);\r\n\tvec4 T10 = texture2D(tDiffuse, st00 + vec2(oneu, 0.0));\r\n\tvec4 T01 = texture2D(tDiffuse, st00 + vec2(0.0, onev));\r\n\tvec4 T11 = texture2D(tDiffuse, st00 + vec2(oneu, onev));\r\n\tfloat D00 = length(remap(T00.rg)) + (T00.b - 0.5) / texw;\r\n\tfloat D10 = length(remap(T10.rg)) + (T10.b - 0.5) / texw;\r\n\tfloat D01 = length(remap(T01.rg)) + (T01.b - 0.5) / texw;\r\n\tfloat D11 = length(remap(T11.rg)) + (T11.b - 0.5) / texw;\r\n\t\r\n\t// Interpolate along v\r\n\tvec2 D0_1 = mix(vec2(D00, D10), vec2(D01, D11), uvlerp.y);\r\n\t\r\n\t// Interpolate along u\r\n\tfloat D = mix(D0_1.x, D0_1.y, uvlerp.x);\r\n\t\r\n\tfloat g = aastep(threshold, D);\r\n\t\r\n\t// Retrieve the B channel to get the original grayscale image\r\n\tfloat c = texture2D(tDiffuse, vUv).b;\r\n\t\r\n\t// Final fragment color\r\n\tgl_FragColor = vec4(vec3(g, c, g), 1.0);\r\n}";
shaders_EDT_$DISPLAY_$RGB.uniforms = { tDiffuse : { type : "t", value : null}, texw : { type : "f", value : 0.0}, texh : { type : "f", value : 0.0}, texLevels : { type : "f", value : 0.0}};
shaders_EDT_$DISPLAY_$RGB.vertexShader = "// Adapted for three.js demo by Sam Twidale.\r\n// Original implementation by Stefan Gustavson 2010.\r\n// This code is in the public domain.\r\n\r\nvarying vec2 vUv;\r\nvarying float oneu;\r\nvarying float onev;\r\n\r\nuniform float texw;\r\nuniform float texh;\r\n\r\nvoid main()\r\n{\r\n\tvUv = uv;\r\n\t\r\n\t// Save divisions in some of the fragment shaders\r\n\toneu = 1.0 / texw;\r\n\tonev = 1.0 / texh;\r\n\t\r\n\tgl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);\r\n}";
shaders_EDT_$DISPLAY_$RGB.fragmentShader = "// Displays the final distance field visualized as an RGB image.\r\n\r\n// Adapted for three.js demo by Sam Twidale.\r\n// Original implementation by Stefan Gustavson 2010.\r\n// This code is in the public domain.\r\n\r\nvarying vec2 vUv;\r\n\r\nuniform sampler2D tDiffuse;\r\nuniform float texw;\r\nuniform float texh;\r\nuniform float texLevels;\r\n\r\n// Helper functions to remap unsigned normalized floats [0.0, 1.0] coming from an integer texture to the range we need [-1, 1].\r\n// The transformations are very specifically designed to map integer texel values exactly to pixel centers, and vice versa.\r\nvec2 remap(vec2 floatdata)\r\n{\r\n\treturn floatdata * (texLevels - 1.0) / texLevels * 2.0 - 1.0;\r\n}\r\n\r\nvoid main()\r\n{\r\n\tvec3 texel = texture2D(tDiffuse, vUv).rgb;\r\n\tvec2 distvec = remap(texel.rg);\r\n\t\r\n    //vec2 rainbow = 0.5 + 0.5 * (normalize(distvec));\r\n    //gl_FragColor = vec4(rainbow, 1.0 - (length(distvec) + texel.b - 0.5) * 4.0, 1.0);\r\n\t\r\n\tfloat dist = length(distvec) + (texel.b - 0.5) / texw;\r\n\tgl_FragColor = vec4(vec2(mod(10.0 * dist, 1.0)), texel.b, 1.0);\r\n}";
shaders_EDT_$DISPLAY_$GRAYSCALE.uniforms = { tDiffuse : { type : "t", value : null}, texw : { type : "f", value : 0.0}, texh : { type : "f", value : 0.0}, texLevels : { type : "f", value : 0.0}, distanceFactor : { type : "f", value : 30.0}};
shaders_EDT_$DISPLAY_$GRAYSCALE.vertexShader = "// Adapted for three.js demo by Sam Twidale.\r\n// Original implementation by Stefan Gustavson 2010.\r\n// This code is in the public domain.\r\n\r\nvarying vec2 vUv;\r\nvarying float oneu;\r\nvarying float onev;\r\n\r\nuniform float texw;\r\nuniform float texh;\r\n\r\nvoid main()\r\n{\r\n\tvUv = uv;\r\n\t\r\n\t// Save divisions in some of the fragment shaders\r\n\toneu = 1.0 / texw;\r\n\tonev = 1.0 / texh;\r\n\t\r\n\tgl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);\r\n}";
shaders_EDT_$DISPLAY_$GRAYSCALE.fragmentShader = "// This code is in the public domain.\r\n\r\nvarying vec2 vUv;\r\nvarying float oneu;\r\nvarying float onev;\r\n\r\nuniform sampler2D tDiffuse;\r\nuniform float texw;\r\nuniform float texh;\r\nuniform float texLevels;\r\nuniform float threshold;\r\nuniform float distanceFactor;\r\n\r\n// Helper functions to remap unsigned normalized floats [0.0, 1.0] coming from an integer texture to the range we need [-1, 1].\r\n// The transformations are very specifically designed to map integer texel values exactly to pixel centers, and vice versa.\r\nvec2 remap(vec2 floatdata)\r\n{\r\n\treturn floatdata * (texLevels - 1.0) / texLevels * 2.0 - 1.0;\r\n}\r\n\r\nvoid main()\r\n{\r\n\t// Scale texcoords to range ([0, texw], [0, texh])\r\n\tvec2 uv = vUv * vec2(texw, texh);\r\n\t\r\n\t// Compute texel-local (u,v) coordinates for the four closest texels\r\n\tvec2 uv00 = floor(uv - vec2(0.5)); // Lower left corner of lower left texel\r\n\tvec2 uvlerp = uv - uv00 - vec2(0.5); // Texel-local lerp blends [0,1]\r\n\t\r\n\t// Center st00 on lower left texel and rescale to [0,1] for texture lookup\r\n\tvec2 st00 = (uv00 + vec2(0.5)) * vec2(oneu, onev);\r\n\t\r\n\t// Compute distance value from four closest 8-bit RGBA texels\r\n\tvec4 T00 = texture2D(tDiffuse, st00);\r\n\tvec4 T10 = texture2D(tDiffuse, st00 + vec2(oneu, 0.0));\r\n\tvec4 T01 = texture2D(tDiffuse, st00 + vec2(0.0, onev));\r\n\tvec4 T11 = texture2D(tDiffuse, st00 + vec2(oneu, onev));\r\n\tfloat D00 = length(remap(T00.rg)) + (T00.b - 0.5) / texw;\r\n\tfloat D10 = length(remap(T10.rg)) + (T10.b - 0.5) / texw;\r\n\tfloat D01 = length(remap(T01.rg)) + (T01.b - 0.5) / texw;\r\n\tfloat D11 = length(remap(T11.rg)) + (T11.b - 0.5) / texw;\r\n\t\r\n\t// Interpolate along v\r\n\tvec2 D0_1 = mix(vec2(D00, D10), vec2(D01, D11), uvlerp.y);\r\n\t\r\n\t// Interpolate along u\r\n\tfloat D = mix(D0_1.x, D0_1.y, uvlerp.x) * distanceFactor;\r\n\t\r\n\t// Final fragment color\r\n\tgl_FragColor = vec4(vec3(D), 1.0);\r\n}";
shaders_EDT_$DISPLAY_$ALPHA_$THRESHOLD.uniforms = { tDiffuse : { type : "t", value : null}, texw : { type : "f", value : 0.0}, texh : { type : "f", value : 0.0}, texLevels : { type : "f", value : 0.0}, threshold : { type : "f", value : 0.0, min : 0.0, max : 1.0}};
shaders_EDT_$DISPLAY_$ALPHA_$THRESHOLD.vertexShader = "// Adapted for three.js demo by Sam Twidale.\r\n// Original implementation by Stefan Gustavson 2010.\r\n// This code is in the public domain.\r\n\r\nvarying vec2 vUv;\r\nvarying float oneu;\r\nvarying float onev;\r\n\r\nuniform float texw;\r\nuniform float texh;\r\n\r\nvoid main()\r\n{\r\n\tvUv = uv;\r\n\t\r\n\t// Save divisions in some of the fragment shaders\r\n\toneu = 1.0 / texw;\r\n\tonev = 1.0 / texh;\r\n\t\r\n\tgl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);\r\n}";
shaders_EDT_$DISPLAY_$ALPHA_$THRESHOLD.fragmentShader = "// Distance map contour texturing.\r\n// Simple alpha thresholding, produces wavey contours.\r\n\r\n// Adapted for three.js demo by Sam Twidale.\r\n// Original implementation by Stefan Gustavson 2011.\r\n// This code is in the public domain.\r\n\r\nvarying vec2 vUv;\r\nvarying float oneu;\r\nvarying float onev;\r\n\r\nuniform sampler2D tDiffuse;\r\nuniform float texw;\r\nuniform float texh;\r\nuniform float texLevels;\r\nuniform float threshold;\r\n\r\n// Replacement for RSLs filterstep(), with fwidth() done right.\r\n// threshold is constant, value is smoothly varying\r\nfloat aastep(float threshold, float value)\r\n{\r\n\tfloat afwidth = 0.7 * length(vec2(dFdx(value), dFdy(value)));\r\n\treturn smoothstep(threshold - afwidth, threshold + afwidth, value); // GLSLs fwidth(value) is abs(dFdx(value)) + abs(dFdy(value))\r\n}\r\n\r\nvoid main()\r\n{\r\n\t// Scale texcoords to range ([0, texw], [0, texh])\r\n\tvec2 uv = vUv * vec2(texw, texh);\r\n\t\r\n\t// Compute texel-local (u,v) coordinates for the four closest texels\r\n\tvec2 uv00 = floor(uv - vec2(0.5)); // Lower left corner of lower left texel\r\n\tvec2 uvlerp = uv - uv00 - vec2(0.5); // Texel-local lerp blends [0,1]\r\n\t\r\n\t// Center st00 on lower left texel and rescale to [0,1] for texture lookup\r\n\tvec2 st00 = (uv00 + vec2(0.5)) * vec2(oneu, onev);\r\n\t\r\n\t// Compute distance value from four closest 8-bit RGBA texels\r\n\tvec4 D00 = texture2D(tDiffuse, st00);\r\n\tvec4 D10 = texture2D(tDiffuse, st00 + vec2(oneu, 0.0));\r\n\tvec4 D01 = texture2D(tDiffuse, st00 + vec2(0.0, onev));\r\n\tvec4 D11 = texture2D(tDiffuse, st00 + vec2(oneu, onev));\r\n\r\n\t// Retrieve the B channel to get the original grayscale image\r\n\tvec4 G = vec4(D00.b, D01.b, D10.b, D11.b);\r\n  \r\n\t// Interpolate along v\r\n\tG.xy = mix(G.xz, G.yw, uvlerp.y);\r\n\r\n\t// Interpolate along u\r\n\tfloat g = mix(G.x, G.y, uvlerp.x);\r\n\r\n\tfloat c = aastep(threshold, g);\r\n\t\r\n\t// Final fragment color\r\n\tgl_FragColor = vec4(vec3(c), 1.0);\r\n}";
shaders_GaussianBlur.uniforms = { tDiffuse : { type : "t", value : null}, direction : { type : "v2", value : new THREE.Vector2(0,0)}, resolution : { type : "v2", value : new THREE.Vector2(1024.0,1024.0)}, flip : { type : "i", value : 0}};
shaders_GaussianBlur.vertexShader = "varying vec2 vUv;\r\n\r\nvoid main()\r\n{\r\n\tvUv = uv;\r\n\tgl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);\r\n}";
shaders_GaussianBlur.fragmentShader = "// Efficient Gaussian blur with linear sampling, based on https://github.com/Jam3/glsl-fast-gaussian-blur by Jam3\r\n// Also see http://rastergrid.com/blog/2010/09/efficient-gaussian-blur-with-linear-sampling/ by Daniel Rakos\r\n// Must use on a texture that has linear (gl.LINEAR) filtering, the linear sampling approach requires this to get info about two adjacent pixels from one texture read, making it faster than discrete sampling\r\n// Requires a horizontal and vertical pass to perform the full blur. It is written this way because a single pass involves many more texture reads\r\n\r\nvarying vec2 vUv;\r\n\r\nuniform sampler2D tDiffuse;\r\nuniform vec2 resolution;\r\nuniform vec2 direction;\r\nuniform int flip;\r\n\r\nvoid main()\r\n{\r\n\tvec2 uv = vUv;\r\n\t\r\n\tif(flip != 0)\r\n\t{\r\n\t\tuv.y = 1.0 - uv.y;\r\n\t}\r\n\t\r\n\tvec2 offset = vec2(1.3333333333333333) * direction;\r\n\tvec4 color = vec4(0.0);\r\n\tcolor += texture2D(tDiffuse, uv) * 0.29411764705882354;\r\n\tcolor += texture2D(tDiffuse, uv + (offset / resolution)) * 0.35294117647058826;\r\n\tcolor += texture2D(tDiffuse, uv - (offset / resolution)) * 0.35294117647058826;\r\n\tgl_FragColor = color;\r\n}";
Main.main();
})(typeof console != "undefined" ? console : {log:function(){}}, typeof window != "undefined" ? window : typeof global != "undefined" ? global : typeof self != "undefined" ? self : this);

//# sourceMappingURL=game.js.map