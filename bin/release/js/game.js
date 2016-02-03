(function (console, $global) { "use strict";
var $estr = function() { return js_Boot.__string_rec(this,''); };
function $extend(from, fields) {
	function Inherit() {} Inherit.prototype = from; var proto = new Inherit();
	for (var name in fields) proto[name] = fields[name];
	if( fields.toString !== Object.prototype.toString ) proto.toString = fields.toString;
	return proto;
}
var Character = function(geometry,material,width,height,metrics) {
	THREE.Mesh.call(this,geometry,material);
	this.width = width;
	this.height = height;
	this.metrics = metrics;
	this.uniforms = material.uniforms;
	this.spawnPosition = new THREE.Vector3(0,0,0);
	this.targetPosition = new THREE.Vector3(0,0,0);
};
Character.__name__ = true;
Character.__super__ = THREE.Mesh;
Character.prototype = $extend(THREE.Mesh.prototype,{
	create: function() {
		var mesh = THREE.Mesh.prototype.clone.call(this);
		var ch = mesh;
		ch.width = this.width;
		ch.height = this.height;
		ch.metrics = this.metrics;
		ch.spawnPosition = new THREE.Vector3(0,0,0);
		ch.targetPosition = new THREE.Vector3(0,0,0);
		ch.uniforms = this.uniforms;
		return ch;
	}
	,__class__: Character
});
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
HxOverrides.remove = function(a,obj) {
	var i = HxOverrides.indexOf(a,obj,0);
	if(i == -1) return false;
	a.splice(i,1);
	return true;
};
HxOverrides.iter = function(a) {
	return { cur : 0, arr : a, hasNext : function() {
		return this.cur < this.arr.length;
	}, next : function() {
		return this.arr[this.cur++];
	}};
};
var InputGenerator = function() { };
InputGenerator.__name__ = true;
InputGenerator.generateText = function(s,width,height,font,scaleFactor) {
	if(scaleFactor == null) scaleFactor = 0.25;
	if(font == null) font = "Consolas";
	if(height == null) height = 512;
	if(width == null) width = 512;
	if(!(s != null)) throw new js__$Boot_HaxeError("FAIL: s != null");
	if(!(font != null)) throw new js__$Boot_HaxeError("FAIL: font != null");
	var canvas;
	var _this = window.document;
	canvas = _this.createElement("canvas");
	canvas.width = width;
	canvas.height = height;
	canvas.style.background = "black";
	var context = canvas.getContext("2d");
	var pxSize = Std["int"](Math.min(width,height) * 0.8 / s.length);
	var scaledPxSize = Std["int"](Math.min(width,height) * 0.8 / s.length * scaleFactor);
	context.fillStyle = "#ffffff";
	context.font = (pxSize == null?"null":"" + pxSize) + "px " + font;
	context.textBaseline = "middle";
	context.textAlign = "center";
	context.antialias = "subpixel";
	context.patternQuality = "best";
	context.filter = "best";
	context.imageSmoothingEnabled = true;
	context.font = (scaledPxSize == null?"null":"" + scaledPxSize) + "px " + font;
	var metrics = context.measureText(s);
	context.font = (pxSize == null?"null":"" + pxSize) + "px " + font;
	context.fillText(s,canvas.width / 2,canvas.height / 2);
	if(scaleFactor < 1.0) canvas = InputGenerator.downScaleCanvas(canvas,scaleFactor);
	return { canvas : canvas, metrics : metrics};
};
InputGenerator.downScaleCanvas = function(cv,scale) {
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
var Main = function() {
	this.characters = [];
	this.characterMap = new haxe_ds_StringMap();
	this.sdfMap = new haxe_ds_StringMap();
	this.loaded = false;
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
		var gameAttachPoint = window.document.getElementById("game");
		gameAttachPoint.appendChild(gameDiv);
		var container = window.document.createElement("div");
		window.document.body.appendChild(container);
		var info = window.document.createElement("div");
		info.style.position = "absolute";
		info.style.top = "20px";
		info.style.width = "100%";
		info.style.textAlign = "center";
		info.style.color = "white";
		info.innerHTML = "<a href=\"https://github.com/Tw1ddle/WebGL-Distance-Fields\" target=\"_blank\">Distance fields</a> by <a href=\"http://www.samcodes.co.uk/\" target=\"_blank\">Sam Twidale</a>. Technique by <a href=\"http://contourtextures.wikidot.com/\" target=\"_blank\">Stefan Gustavson</a>.";
		container.appendChild(info);
		var width = window.innerWidth * this.renderer.getPixelRatio();
		var height = window.innerHeight * this.renderer.getPixelRatio();
		this.scene = new THREE.Scene();
		this.camera = new THREE.PerspectiveCamera(75,width / height,1.0,8000.0);
		this.camera.position.z = 150;
		this.composer = new THREE.EffectComposer(this.renderer);
		var renderPass = new THREE.RenderPass(this.scene,this.camera);
		this.aaPass = new THREE.ShaderPass({ vertexShader : shaders_FXAA.vertexShader, fragmentShader : shaders_FXAA.fragmentShader, uniforms : shaders_FXAA.uniforms});
		this.aaPass.renderToScreen = true;
		this.aaPass.uniforms.resolution.value.set(width,height);
		this.composer.addPass(renderPass);
		this.composer.addPass(this.aaPass);
		this.onResize();
		this.sdfMaker = new sdf_generator_SDFMaker(this.renderer);
		this.blurMaterial = new THREE.ShaderMaterial({ vertexShader : sdf_shaders_GaussianBlur.vertexShader, fragmentShader : sdf_shaders_GaussianBlur.fragmentShader, uniforms : sdf_shaders_GaussianBlur.uniforms});
		this.blurRenderTargetParams = { minFilter : THREE.LinearFilter, magFilter : THREE.LinearFilter, wrapS : THREE.RepeatWrapping, wrapT : THREE.RepeatWrapping, format : THREE.RGBAFormat, stencilBuffer : false, depthBuffer : false, type : THREE.UnsignedByteType};
		window.addEventListener("resize",function() {
			_g.onResize();
		},true);
		window.addEventListener("contextmenu",function(event1) {
			event1.preventDefault();
		},true);
		window.addEventListener("keypress",function(event2) {
			if(!_g.loaded) {
				event2.preventDefault();
				return;
			}
			var keycode;
			if(event2.which == null) keycode = event2.keyCode; else keycode = event2.which;
			if(keycode <= 0) {
				event2.preventDefault();
				return;
			}
			var ch = String.fromCharCode(keycode);
			if(ch.length > 0 && keycode != 8) {
				_g.generateDistanceFieldForString(ch);
				_g.addCharacter(_g.characterMap.get(ch).create());
			}
			event2.preventDefault();
		},true);
		window.addEventListener("keydown",function(event3) {
			if(!_g.loaded) {
				event3.preventDefault();
				return;
			}
			var keycode1;
			if(event3.which == null) keycode1 = event3.keyCode; else keycode1 = event3.which;
			if(keycode1 == 8 || keycode1 == 46) {
				_g.removeCharacter();
				event3.preventDefault();
			}
		},true);
		var onMouseWheel = function(event) {
			if(!_g.loaded) {
				event.preventDefault();
				return;
			}
			var delta;
			if(event.wheelDelta == null) delta = event.detail; else delta = event.wheelDelta;
			if(delta > 0) _g.camera.position.z -= 20; else if(delta < 0) _g.camera.position.z += 20;
			event.preventDefault();
		};
		window.document.addEventListener("mousewheel",onMouseWheel,false);
		window.document.addEventListener("DOMMouseScroll",onMouseWheel,false);
		this.generateDelayedString("TYPE SOMETHING! ",300);
		this.loaded = true;
		gameDiv.appendChild(this.renderer.domElement);
		window.requestAnimationFrame($bind(this,this.animate));
	}
	,generateDelayedString: function(message,msPerLetter) {
		var _g2 = this;
		var t = msPerLetter;
		var _g1 = 0;
		var _g = message.length;
		while(_g1 < _g) {
			var i = [_g1++];
			haxe_Timer.delay((function(i) {
				return function() {
					_g2.generateDistanceFieldForString(message.charAt(i[0]));
					_g2.addCharacter(_g2.characterMap.get(message.charAt(i[0])).create());
				};
			})(i),t);
			t += msPerLetter;
		}
	}
	,onResize: function() {
		var width = window.innerWidth * this.renderer.getPixelRatio();
		var height = window.innerHeight * this.renderer.getPixelRatio();
		this.renderer.setSize(window.innerWidth,window.innerHeight);
		this.composer.setSize(width,height);
		this.aaPass.uniforms.resolution.value.set(width,height);
		this.camera.aspect = width / height;
		this.camera.updateProjectionMatrix();
	}
	,generateDistanceFieldForString: function(s) {
		if(!this.characterMap.exists(s)) {
			var data = InputGenerator.generateText(s);
			this.generateDistanceField(data.canvas,data.metrics,s,null);
		}
	}
	,generateDistanceField: function(element,metrics,id,blurInput) {
		if(blurInput == null) blurInput = true;
		var texture = new THREE.Texture(element,THREE.UVMapping);
		texture.needsUpdate = true;
		var width = texture.image.width;
		var height = texture.image.height;
		var target = this.sdfMap.get(id);
		if(target == null) {
			target = this.sdfMaker.transformTexture(texture,blurInput);
			this.sdfMap.set(id,target);
		}
		var geometry = new THREE.PlaneGeometry(width,height);
		var demoMaterial = new THREE.ShaderMaterial({ vertexShader : shaders_EDT_$DISPLAY_$DEMO.vertexShader, fragmentShader : shaders_EDT_$DISPLAY_$DEMO.fragmentShader, uniforms : THREE.UniformsUtils.clone(shaders_EDT_$DISPLAY_$DEMO.uniforms)});
		demoMaterial.transparent = true;
		demoMaterial.derivatives = true;
		demoMaterial.uniforms.tDiffuse.value = target;
		demoMaterial.uniforms.texw.value = width;
		demoMaterial.uniforms.texh.value = height;
		demoMaterial.uniforms.texLevels.value = this.sdfMaker.texLevels;
		demoMaterial.uniforms.threshold.value = 0.0;
		demoMaterial.uniforms.alpha.value = 1.0;
		demoMaterial.uniforms.color.value.set(Math.random() * 0.04,Math.random() * 0.2,0.5 + Math.random() * 0.5);
		this.characterMap.set(id,new Character(geometry,demoMaterial,target.width,target.height,metrics));
	}
	,addCharacter: function(character) {
		if(!(character != null)) throw new js__$Boot_HaxeError("FAIL: character != null");
		this.scene.add(character);
		var spawn = character.spawnPosition;
		var target = character.targetPosition;
		if(this.characters.length > 0) {
			var lastTarget = this.characters[this.characters.length - 1].targetPosition;
			target.set(lastTarget.x + character.metrics.width,lastTarget.y,lastTarget.z + 1.0);
		} else target.set(0,0,0);
		spawn.set(target.x + 50 + Math.random() * 300,target.y + Math.random() * 300 - 150,target.z);
		character.position.set(spawn.x,spawn.y,spawn.z);
		character.scale.set(0,0,1);
		this.characters.push(character);
		motion_Actuate.tween(character.scale,1,{ x : 1.0, y : 1.0});
		motion_Actuate.tween(character.position,1,{ x : target.x, y : target.y, z : target.z});
		motion_Actuate.tween(this.camera.position,1,{ x : target.x, y : target.y, z : Math.min(1000,this.camera.position.z + 25)});
	}
	,removeCharacter: function() {
		var _g = this;
		if(this.characters.length == 0) return;
		var character = this.characters.pop();
		if(!(character != null)) throw new js__$Boot_HaxeError("FAIL: character != null");
		motion_Actuate.tween(character.scale,1,{ x : 0.0, y : 0.0});
		if(this.characters.length > 0) {
			var last = this.characters[this.characters.length - 1].position;
			motion_Actuate.tween(this.camera.position,1,{ x : last.x, y : last.y, z : Math.max(150,this.camera.position.z - 25)});
		}
		motion_Actuate.tween(character.position,1,{ x : character.spawnPosition.x, y : character.spawnPosition.y}).onComplete(function() {
			_g.scene.remove(character);
		});
	}
	,animate: function(time) {
		Main.dt = (time - Main.lastAnimationTime) * 0.001;
		Main.lastAnimationTime = time;
		this.composer.render(Main.dt);
		window.requestAnimationFrame($bind(this,this.animate));
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
Reflect.setField = function(o,field,value) {
	o[field] = value;
};
Reflect.getProperty = function(o,field) {
	var tmp;
	if(o == null) return null; else if(o.__properties__ && (tmp = o.__properties__["get_" + field])) return o[tmp](); else return o[field];
};
Reflect.setProperty = function(o,field,value) {
	var tmp;
	if(o.__properties__ && (tmp = o.__properties__["set_" + field])) o[tmp](value); else o[field] = value;
};
Reflect.callMethod = function(o,func,args) {
	return func.apply(o,args);
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
var Std = function() { };
Std.__name__ = true;
Std.string = function(s) {
	return js_Boot.__string_rec(s,"");
};
Std["int"] = function(x) {
	return x | 0;
};
var Type = function() { };
Type.__name__ = true;
Type.createInstance = function(cl,args) {
	var _g = args.length;
	switch(_g) {
	case 0:
		return new cl();
	case 1:
		return new cl(args[0]);
	case 2:
		return new cl(args[0],args[1]);
	case 3:
		return new cl(args[0],args[1],args[2]);
	case 4:
		return new cl(args[0],args[1],args[2],args[3]);
	case 5:
		return new cl(args[0],args[1],args[2],args[3],args[4]);
	case 6:
		return new cl(args[0],args[1],args[2],args[3],args[4],args[5]);
	case 7:
		return new cl(args[0],args[1],args[2],args[3],args[4],args[5],args[6]);
	case 8:
		return new cl(args[0],args[1],args[2],args[3],args[4],args[5],args[6],args[7]);
	default:
		throw new js__$Boot_HaxeError("Too many arguments");
	}
	return null;
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
var haxe_Timer = function(time_ms) {
	var me = this;
	this.id = setInterval(function() {
		me.run();
	},time_ms);
};
haxe_Timer.__name__ = true;
haxe_Timer.delay = function(f,time_ms) {
	var t = new haxe_Timer(time_ms);
	t.run = function() {
		t.stop();
		f();
	};
	return t;
};
haxe_Timer.stamp = function() {
	return new Date().getTime() / 1000;
};
haxe_Timer.prototype = {
	stop: function() {
		if(this.id == null) return;
		clearInterval(this.id);
		this.id = null;
	}
	,run: function() {
	}
	,__class__: haxe_Timer
};
var haxe_ds_ObjectMap = function() {
	this.h = { };
	this.h.__keys__ = { };
};
haxe_ds_ObjectMap.__name__ = true;
haxe_ds_ObjectMap.__interfaces__ = [haxe_IMap];
haxe_ds_ObjectMap.prototype = {
	set: function(key,value) {
		var id = key.__id__ || (key.__id__ = ++haxe_ds_ObjectMap.count);
		this.h[id] = value;
		this.h.__keys__[id] = key;
	}
	,remove: function(key) {
		var id = key.__id__;
		if(this.h.__keys__[id] == null) return false;
		delete(this.h[id]);
		delete(this.h.__keys__[id]);
		return true;
	}
	,keys: function() {
		var a = [];
		for( var key in this.h.__keys__ ) {
		if(this.h.hasOwnProperty(key)) a.push(this.h.__keys__[key]);
		}
		return HxOverrides.iter(a);
	}
	,iterator: function() {
		return { ref : this.h, it : this.keys(), hasNext : function() {
			return this.it.hasNext();
		}, next : function() {
			var i = this.it.next();
			return this.ref[i.__id__];
		}};
	}
	,__class__: haxe_ds_ObjectMap
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
	,get: function(key) {
		if(__map_reserved[key] != null) return this.getReserved(key);
		return this.h[key];
	}
	,exists: function(key) {
		if(__map_reserved[key] != null) return this.existsReserved(key);
		return this.h.hasOwnProperty(key);
	}
	,setReserved: function(key,value) {
		if(this.rh == null) this.rh = { };
		this.rh["$" + key] = value;
	}
	,getReserved: function(key) {
		if(this.rh == null) return null; else return this.rh["$" + key];
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
js_Boot.__cast = function(o,t) {
	if(js_Boot.__instanceof(o,t)) return o; else throw new js__$Boot_HaxeError("Cannot cast " + Std.string(o) + " to " + Std.string(t));
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
var motion_actuators_IGenericActuator = function() { };
motion_actuators_IGenericActuator.__name__ = true;
motion_actuators_IGenericActuator.prototype = {
	__class__: motion_actuators_IGenericActuator
};
var motion_actuators_GenericActuator = function(target,duration,properties) {
	this._autoVisible = true;
	this._delay = 0;
	this._reflect = false;
	this._repeat = 0;
	this._reverse = false;
	this._smartRotation = false;
	this._snapping = false;
	this.special = false;
	this.target = target;
	this.properties = properties;
	this.duration = duration;
	this._ease = motion_Actuate.defaultEase;
};
motion_actuators_GenericActuator.__name__ = true;
motion_actuators_GenericActuator.__interfaces__ = [motion_actuators_IGenericActuator];
motion_actuators_GenericActuator.prototype = {
	apply: function() {
		var _g = 0;
		var _g1 = Reflect.fields(this.properties);
		while(_g < _g1.length) {
			var i = _g1[_g];
			++_g;
			if(Object.prototype.hasOwnProperty.call(this.target,i)) Reflect.setField(this.target,i,Reflect.field(this.properties,i)); else Reflect.setProperty(this.target,i,Reflect.field(this.properties,i));
		}
	}
	,autoVisible: function(value) {
		if(value == null) value = true;
		this._autoVisible = value;
		return this;
	}
	,callMethod: function(method,params) {
		if(params == null) params = [];
		return Reflect.callMethod(method,method,params);
	}
	,change: function() {
		if(this._onUpdate != null) this.callMethod(this._onUpdate,this._onUpdateParams);
	}
	,complete: function(sendEvent) {
		if(sendEvent == null) sendEvent = true;
		if(sendEvent) {
			this.change();
			if(this._onComplete != null) this.callMethod(this._onComplete,this._onCompleteParams);
		}
		motion_Actuate.unload(this);
	}
	,delay: function(duration) {
		this._delay = duration;
		return this;
	}
	,ease: function(easing) {
		this._ease = easing;
		return this;
	}
	,move: function() {
	}
	,onComplete: function(handler,parameters) {
		this._onComplete = handler;
		if(parameters == null) this._onCompleteParams = []; else this._onCompleteParams = parameters;
		if(this.duration == 0) this.complete();
		return this;
	}
	,onRepeat: function(handler,parameters) {
		this._onRepeat = handler;
		if(parameters == null) this._onRepeatParams = []; else this._onRepeatParams = parameters;
		return this;
	}
	,onUpdate: function(handler,parameters) {
		this._onUpdate = handler;
		if(parameters == null) this._onUpdateParams = []; else this._onUpdateParams = parameters;
		return this;
	}
	,onPause: function(handler,parameters) {
		this._onPause = handler;
		if(parameters == null) this._onPauseParams = []; else this._onPauseParams = parameters;
		return this;
	}
	,onResume: function(handler,parameters) {
		this._onResume = handler;
		if(parameters == null) this._onResumeParams = []; else this._onResumeParams = parameters;
		return this;
	}
	,pause: function() {
		if(this._onPause != null) this.callMethod(this._onPause,this._onPauseParams);
	}
	,reflect: function(value) {
		if(value == null) value = true;
		this._reflect = value;
		this.special = true;
		return this;
	}
	,repeat: function(times) {
		if(times == null) times = -1;
		this._repeat = times;
		return this;
	}
	,resume: function() {
		if(this._onResume != null) this.callMethod(this._onResume,this._onResumeParams);
	}
	,reverse: function(value) {
		if(value == null) value = true;
		this._reverse = value;
		this.special = true;
		return this;
	}
	,smartRotation: function(value) {
		if(value == null) value = true;
		this._smartRotation = value;
		this.special = true;
		return this;
	}
	,snapping: function(value) {
		if(value == null) value = true;
		this._snapping = value;
		this.special = true;
		return this;
	}
	,stop: function(properties,complete,sendEvent) {
	}
	,__class__: motion_actuators_GenericActuator
};
var motion_actuators_SimpleActuator = function(target,duration,properties) {
	this.active = true;
	this.propertyDetails = [];
	this.sendChange = false;
	this.paused = false;
	this.cacheVisible = false;
	this.initialized = false;
	this.setVisible = false;
	this.toggleVisible = false;
	this.startTime = haxe_Timer.stamp();
	motion_actuators_GenericActuator.call(this,target,duration,properties);
	if(!motion_actuators_SimpleActuator.addedEvent) {
		motion_actuators_SimpleActuator.addedEvent = true;
		motion_actuators_SimpleActuator.timer = new haxe_Timer(33);
		motion_actuators_SimpleActuator.timer.run = motion_actuators_SimpleActuator.stage_onEnterFrame;
	}
};
motion_actuators_SimpleActuator.__name__ = true;
motion_actuators_SimpleActuator.stage_onEnterFrame = function() {
	var currentTime = haxe_Timer.stamp();
	var actuator;
	var j = 0;
	var cleanup = false;
	var _g1 = 0;
	var _g = motion_actuators_SimpleActuator.actuatorsLength;
	while(_g1 < _g) {
		var i = _g1++;
		actuator = motion_actuators_SimpleActuator.actuators[j];
		if(actuator != null && actuator.active) {
			if(currentTime >= actuator.timeOffset) actuator.update(currentTime);
			j++;
		} else {
			motion_actuators_SimpleActuator.actuators.splice(j,1);
			--motion_actuators_SimpleActuator.actuatorsLength;
		}
	}
};
motion_actuators_SimpleActuator.__super__ = motion_actuators_GenericActuator;
motion_actuators_SimpleActuator.prototype = $extend(motion_actuators_GenericActuator.prototype,{
	setField_motion_actuators_MotionPathActuator_T: function(target,propertyName,value) {
		if(Object.prototype.hasOwnProperty.call(target,propertyName)) target[propertyName] = value; else Reflect.setProperty(target,propertyName,value);
	}
	,setField_motion_actuators_SimpleActuator_T: function(target,propertyName,value) {
		if(Object.prototype.hasOwnProperty.call(target,propertyName)) target[propertyName] = value; else Reflect.setProperty(target,propertyName,value);
	}
	,autoVisible: function(value) {
		if(value == null) value = true;
		this._autoVisible = value;
		if(!value) {
			this.toggleVisible = false;
			if(this.setVisible) this.setField_motion_actuators_SimpleActuator_T(this.target,"visible",this.cacheVisible);
		}
		return this;
	}
	,delay: function(duration) {
		this._delay = duration;
		this.timeOffset = this.startTime + duration;
		return this;
	}
	,getField: function(target,propertyName) {
		var value = null;
		if(Object.prototype.hasOwnProperty.call(target,propertyName)) value = Reflect.field(target,propertyName); else value = Reflect.getProperty(target,propertyName);
		return value;
	}
	,initialize: function() {
		var details;
		var start;
		var _g = 0;
		var _g1 = Reflect.fields(this.properties);
		while(_g < _g1.length) {
			var i = _g1[_g];
			++_g;
			var isField = true;
			if(Object.prototype.hasOwnProperty.call(this.target,i)) start = Reflect.field(this.target,i); else {
				isField = false;
				start = Reflect.getProperty(this.target,i);
			}
			if(typeof(start) == "number") {
				var value = this.getField(this.properties,i);
				if(start == null) start = 0;
				if(value == null) value = 0;
				details = new motion_actuators_PropertyDetails(this.target,i,start,value - start,isField);
				this.propertyDetails.push(details);
			}
		}
		this.detailsLength = this.propertyDetails.length;
		this.initialized = true;
	}
	,move: function() {
		this.toggleVisible = Object.prototype.hasOwnProperty.call(this.properties,"alpha") && Object.prototype.hasOwnProperty.call(this.properties,"visible");
		if(this.toggleVisible && this.properties.alpha != 0 && !this.getField(this.target,"visible")) {
			this.setVisible = true;
			this.cacheVisible = this.getField(this.target,"visible");
			this.setField_motion_actuators_SimpleActuator_T(this.target,"visible",true);
		}
		this.timeOffset = this.startTime;
		motion_actuators_SimpleActuator.actuators.push(this);
		++motion_actuators_SimpleActuator.actuatorsLength;
	}
	,onUpdate: function(handler,parameters) {
		this._onUpdate = handler;
		if(parameters == null) this._onUpdateParams = []; else this._onUpdateParams = parameters;
		this.sendChange = true;
		return this;
	}
	,pause: function() {
		if(!this.paused) {
			this.paused = true;
			motion_actuators_GenericActuator.prototype.pause.call(this);
			this.pauseTime = haxe_Timer.stamp();
		}
	}
	,resume: function() {
		if(this.paused) {
			this.paused = false;
			this.timeOffset += haxe_Timer.stamp() - this.pauseTime;
			motion_actuators_GenericActuator.prototype.resume.call(this);
		}
	}
	,setProperty: function(details,value) {
		if(details.isField) details.target[details.propertyName] = value; else Reflect.setProperty(details.target,details.propertyName,value);
	}
	,stop: function(properties,complete,sendEvent) {
		if(this.active) {
			if(properties == null) {
				this.active = false;
				if(complete) this.apply();
				this.complete(sendEvent);
				return;
			}
			var _g = 0;
			var _g1 = Reflect.fields(properties);
			while(_g < _g1.length) {
				var i = _g1[_g];
				++_g;
				if(Object.prototype.hasOwnProperty.call(this.properties,i)) {
					this.active = false;
					if(complete) this.apply();
					this.complete(sendEvent);
					return;
				}
			}
		}
	}
	,update: function(currentTime) {
		if(!this.paused) {
			var details;
			var easing;
			var i;
			var tweenPosition = (currentTime - this.timeOffset) / this.duration;
			if(tweenPosition > 1) tweenPosition = 1;
			if(!this.initialized) this.initialize();
			if(!this.special) {
				easing = this._ease.calculate(tweenPosition);
				var _g1 = 0;
				var _g = this.detailsLength;
				while(_g1 < _g) {
					var i1 = _g1++;
					details = this.propertyDetails[i1];
					this.setProperty(details,details.start + details.change * easing);
				}
			} else {
				if(!this._reverse) easing = this._ease.calculate(tweenPosition); else easing = this._ease.calculate(1 - tweenPosition);
				var endValue;
				var _g11 = 0;
				var _g2 = this.detailsLength;
				while(_g11 < _g2) {
					var i2 = _g11++;
					details = this.propertyDetails[i2];
					if(this._smartRotation && (details.propertyName == "rotation" || details.propertyName == "rotationX" || details.propertyName == "rotationY" || details.propertyName == "rotationZ")) {
						var rotation = details.change % 360;
						if(rotation > 180) rotation -= 360; else if(rotation < -180) rotation += 360;
						endValue = details.start + rotation * easing;
					} else endValue = details.start + details.change * easing;
					if(!this._snapping) {
						if(details.isField) details.target[details.propertyName] = endValue; else Reflect.setProperty(details.target,details.propertyName,endValue);
					} else this.setProperty(details,Math.round(endValue));
				}
			}
			if(tweenPosition == 1) {
				if(this._repeat == 0) {
					this.active = false;
					if(this.toggleVisible && this.getField(this.target,"alpha") == 0) this.setField_motion_actuators_SimpleActuator_T(this.target,"visible",false);
					this.complete(true);
					return;
				} else {
					if(this._onRepeat != null) this.callMethod(this._onRepeat,this._onRepeatParams);
					if(this._reflect) this._reverse = !this._reverse;
					this.startTime = currentTime;
					this.timeOffset = this.startTime + this._delay;
					if(this._repeat > 0) this._repeat--;
				}
			}
			if(this.sendChange) this.change();
		}
	}
	,__class__: motion_actuators_SimpleActuator
});
var motion_easing_Expo = function() { };
motion_easing_Expo.__name__ = true;
motion_easing_Expo.__properties__ = {get_easeOut:"get_easeOut",get_easeInOut:"get_easeInOut",get_easeIn:"get_easeIn"}
motion_easing_Expo.get_easeIn = function() {
	return new motion_easing_ExpoEaseIn();
};
motion_easing_Expo.get_easeInOut = function() {
	return new motion_easing_ExpoEaseInOut();
};
motion_easing_Expo.get_easeOut = function() {
	return new motion_easing_ExpoEaseOut();
};
var motion_easing_IEasing = function() { };
motion_easing_IEasing.__name__ = true;
motion_easing_IEasing.prototype = {
	__class__: motion_easing_IEasing
};
var motion_easing_ExpoEaseOut = function() {
};
motion_easing_ExpoEaseOut.__name__ = true;
motion_easing_ExpoEaseOut.__interfaces__ = [motion_easing_IEasing];
motion_easing_ExpoEaseOut.prototype = {
	calculate: function(k) {
		if(k == 1) return 1; else return 1 - Math.pow(2,-10 * k);
	}
	,ease: function(t,b,c,d) {
		if(t == d) return b + c; else return c * (1 - Math.pow(2,-10 * t / d)) + b;
	}
	,__class__: motion_easing_ExpoEaseOut
};
var motion_Actuate = function() { };
motion_Actuate.__name__ = true;
motion_Actuate.apply = function(target,properties,customActuator) {
	motion_Actuate.stop(target,properties);
	if(customActuator == null) customActuator = motion_Actuate.defaultActuator;
	var actuator = Type.createInstance(customActuator,[target,0,properties]);
	actuator.apply();
	return actuator;
};
motion_Actuate.getLibrary = function(target,allowCreation) {
	if(allowCreation == null) allowCreation = true;
	if(!(motion_Actuate.targetLibraries.h.__keys__[target.__id__] != null) && allowCreation) motion_Actuate.targetLibraries.set(target,[]);
	return motion_Actuate.targetLibraries.h[target.__id__];
};
motion_Actuate.isActive = function() {
	var result = false;
	var $it0 = motion_Actuate.targetLibraries.iterator();
	while( $it0.hasNext() ) {
		var library = $it0.next();
		result = true;
		break;
	}
	return result;
};
motion_Actuate.motionPath = function(target,duration,properties,overwrite) {
	if(overwrite == null) overwrite = true;
	return motion_Actuate.tween(target,duration,properties,overwrite,motion_actuators_MotionPathActuator);
};
motion_Actuate.pause = function(target) {
	if(js_Boot.__instanceof(target,motion_actuators_IGenericActuator)) {
		var actuator = target;
		actuator.pause();
	} else {
		var library = motion_Actuate.getLibrary(target,false);
		if(library != null) {
			var _g = 0;
			while(_g < library.length) {
				var actuator1 = library[_g];
				++_g;
				actuator1.pause();
			}
		}
	}
};
motion_Actuate.pauseAll = function() {
	var $it0 = motion_Actuate.targetLibraries.iterator();
	while( $it0.hasNext() ) {
		var library = $it0.next();
		var _g = 0;
		while(_g < library.length) {
			var actuator = library[_g];
			++_g;
			actuator.pause();
		}
	}
};
motion_Actuate.reset = function() {
	var $it0 = motion_Actuate.targetLibraries.iterator();
	while( $it0.hasNext() ) {
		var library = $it0.next();
		var i = library.length - 1;
		while(i >= 0) {
			library[i].stop(null,false,false);
			i--;
		}
	}
	motion_Actuate.targetLibraries = new haxe_ds_ObjectMap();
};
motion_Actuate.resume = function(target) {
	if(js_Boot.__instanceof(target,motion_actuators_IGenericActuator)) {
		var actuator = target;
		actuator.resume();
	} else {
		var library = motion_Actuate.getLibrary(target,false);
		if(library != null) {
			var _g = 0;
			while(_g < library.length) {
				var actuator1 = library[_g];
				++_g;
				actuator1.resume();
			}
		}
	}
};
motion_Actuate.resumeAll = function() {
	var $it0 = motion_Actuate.targetLibraries.iterator();
	while( $it0.hasNext() ) {
		var library = $it0.next();
		var _g = 0;
		while(_g < library.length) {
			var actuator = library[_g];
			++_g;
			actuator.resume();
		}
	}
};
motion_Actuate.stop = function(target,properties,complete,sendEvent) {
	if(sendEvent == null) sendEvent = true;
	if(complete == null) complete = false;
	if(target != null) {
		if(js_Boot.__instanceof(target,motion_actuators_IGenericActuator)) {
			var actuator = target;
			actuator.stop(null,complete,sendEvent);
		} else {
			var library = motion_Actuate.getLibrary(target,false);
			if(library != null) {
				if(typeof(properties) == "string") {
					var temp = { };
					Reflect.setField(temp,properties,null);
					properties = temp;
				} else if((properties instanceof Array) && properties.__enum__ == null) {
					var temp1 = { };
					var _g = 0;
					var _g1;
					_g1 = js_Boot.__cast(properties , Array);
					while(_g < _g1.length) {
						var property = _g1[_g];
						++_g;
						Reflect.setField(temp1,property,null);
					}
					properties = temp1;
				}
				var i = library.length - 1;
				while(i >= 0) {
					library[i].stop(properties,complete,sendEvent);
					i--;
				}
			}
		}
	}
};
motion_Actuate.timer = function(duration,customActuator) {
	return motion_Actuate.tween(new motion__$Actuate_TweenTimer(0),duration,new motion__$Actuate_TweenTimer(1),false,customActuator);
};
motion_Actuate.tween = function(target,duration,properties,overwrite,customActuator) {
	if(overwrite == null) overwrite = true;
	if(target != null) {
		if(duration > 0) {
			if(customActuator == null) customActuator = motion_Actuate.defaultActuator;
			var actuator = Type.createInstance(customActuator,[target,duration,properties]);
			var library = motion_Actuate.getLibrary(actuator.target);
			if(overwrite) {
				var i = library.length - 1;
				while(i >= 0) {
					library[i].stop(actuator.properties,false,false);
					i--;
				}
				library = motion_Actuate.getLibrary(actuator.target);
			}
			library.push(actuator);
			actuator.move();
			return actuator;
		} else return motion_Actuate.apply(target,properties,customActuator);
	}
	return null;
};
motion_Actuate.unload = function(actuator) {
	var target = actuator.target;
	if(motion_Actuate.targetLibraries.h.__keys__[target.__id__] != null) {
		HxOverrides.remove(motion_Actuate.targetLibraries.h[target.__id__],actuator);
		if(motion_Actuate.targetLibraries.h[target.__id__].length == 0) motion_Actuate.targetLibraries.remove(target);
	}
};
motion_Actuate.update = function(target,duration,start,end,overwrite) {
	if(overwrite == null) overwrite = true;
	var properties = { start : start, end : end};
	return motion_Actuate.tween(target,duration,properties,overwrite,motion_actuators_MethodActuator);
};
var motion__$Actuate_TweenTimer = function(progress) {
	this.progress = progress;
};
motion__$Actuate_TweenTimer.__name__ = true;
motion__$Actuate_TweenTimer.prototype = {
	__class__: motion__$Actuate_TweenTimer
};
var motion_MotionPath = function() {
	this._x = new motion_ComponentPath();
	this._y = new motion_ComponentPath();
	this._rotation = null;
};
motion_MotionPath.__name__ = true;
motion_MotionPath.prototype = {
	bezier: function(x,y,controlX,controlY,strength) {
		if(strength == null) strength = 1;
		this._x.addPath(new motion_BezierPath(x,controlX,strength));
		this._y.addPath(new motion_BezierPath(y,controlY,strength));
		return this;
	}
	,line: function(x,y,strength) {
		if(strength == null) strength = 1;
		this._x.addPath(new motion_LinearPath(x,strength));
		this._y.addPath(new motion_LinearPath(y,strength));
		return this;
	}
	,get_rotation: function() {
		if(this._rotation == null) this._rotation = new motion_RotationPath(this._x,this._y);
		return this._rotation;
	}
	,get_x: function() {
		return this._x;
	}
	,get_y: function() {
		return this._y;
	}
	,__class__: motion_MotionPath
	,__properties__: {get_y:"get_y",get_x:"get_x",get_rotation:"get_rotation"}
};
var motion_IComponentPath = function() { };
motion_IComponentPath.__name__ = true;
motion_IComponentPath.prototype = {
	__class__: motion_IComponentPath
	,__properties__: {get_end:"get_end"}
};
var motion_ComponentPath = function() {
	this.paths = [];
	this.start = 0;
	this.totalStrength = 0;
};
motion_ComponentPath.__name__ = true;
motion_ComponentPath.__interfaces__ = [motion_IComponentPath];
motion_ComponentPath.prototype = {
	addPath: function(path) {
		this.paths.push(path);
		this.totalStrength += path.strength;
	}
	,calculate: function(k) {
		if(this.paths.length == 1) return this.paths[0].calculate(this.start,k); else {
			var ratio = k * this.totalStrength;
			var lastEnd = this.start;
			var _g = 0;
			var _g1 = this.paths;
			while(_g < _g1.length) {
				var path = _g1[_g];
				++_g;
				if(ratio > path.strength) {
					ratio -= path.strength;
					lastEnd = path.end;
				} else return path.calculate(lastEnd,ratio / path.strength);
			}
		}
		return 0;
	}
	,get_end: function() {
		if(this.paths.length > 0) {
			var path = this.paths[this.paths.length - 1];
			return path.end;
		} else return this.start;
	}
	,__class__: motion_ComponentPath
	,__properties__: {get_end:"get_end"}
};
var motion_BezierPath = function(end,control,strength) {
	this.end = end;
	this.control = control;
	this.strength = strength;
};
motion_BezierPath.__name__ = true;
motion_BezierPath.prototype = {
	calculate: function(start,k) {
		return (1 - k) * (1 - k) * start + 2 * (1 - k) * k * this.control + k * k * this.end;
	}
	,__class__: motion_BezierPath
};
var motion_LinearPath = function(end,strength) {
	motion_BezierPath.call(this,end,0,strength);
};
motion_LinearPath.__name__ = true;
motion_LinearPath.__super__ = motion_BezierPath;
motion_LinearPath.prototype = $extend(motion_BezierPath.prototype,{
	calculate: function(start,k) {
		return start + k * (this.end - start);
	}
	,__class__: motion_LinearPath
});
var motion_RotationPath = function(x,y) {
	this.step = 0.01;
	this._x = x;
	this._y = y;
	this.offset = 0;
	this.start = this.calculate(0.0);
};
motion_RotationPath.__name__ = true;
motion_RotationPath.__interfaces__ = [motion_IComponentPath];
motion_RotationPath.prototype = {
	calculate: function(k) {
		var dX = this._x.calculate(k) - this._x.calculate(k + this.step);
		var dY = this._y.calculate(k) - this._y.calculate(k + this.step);
		var angle = Math.atan2(dY,dX) * (180 / Math.PI);
		angle = (angle + this.offset) % 360;
		return angle;
	}
	,get_end: function() {
		return this.calculate(1.0);
	}
	,__class__: motion_RotationPath
	,__properties__: {get_end:"get_end"}
};
var motion_actuators_MethodActuator = function(target,duration,properties) {
	this.currentParameters = [];
	this.tweenProperties = { };
	motion_actuators_SimpleActuator.call(this,target,duration,properties);
	if(!Object.prototype.hasOwnProperty.call(properties,"start")) this.properties.start = [];
	if(!Object.prototype.hasOwnProperty.call(properties,"end")) this.properties.end = this.properties.start;
	var _g1 = 0;
	var _g = this.properties.start.length;
	while(_g1 < _g) {
		var i = _g1++;
		this.currentParameters.push(this.properties.start[i]);
	}
};
motion_actuators_MethodActuator.__name__ = true;
motion_actuators_MethodActuator.__super__ = motion_actuators_SimpleActuator;
motion_actuators_MethodActuator.prototype = $extend(motion_actuators_SimpleActuator.prototype,{
	apply: function() {
		this.callMethod(this.target,this.properties.end);
	}
	,complete: function(sendEvent) {
		if(sendEvent == null) sendEvent = true;
		var _g1 = 0;
		var _g = this.properties.start.length;
		while(_g1 < _g) {
			var i = _g1++;
			this.currentParameters[i] = Reflect.field(this.tweenProperties,"param" + i);
		}
		this.callMethod(this.target,this.currentParameters);
		motion_actuators_SimpleActuator.prototype.complete.call(this,sendEvent);
	}
	,initialize: function() {
		var details;
		var propertyName;
		var start;
		var _g1 = 0;
		var _g = this.properties.start.length;
		while(_g1 < _g) {
			var i = _g1++;
			propertyName = "param" + i;
			start = this.properties.start[i];
			this.tweenProperties[propertyName] = start;
			if(typeof(start) == "number" || ((start | 0) === start)) {
				details = new motion_actuators_PropertyDetails(this.tweenProperties,propertyName,start,this.properties.end[i] - start);
				this.propertyDetails.push(details);
			}
		}
		this.detailsLength = this.propertyDetails.length;
		this.initialized = true;
	}
	,update: function(currentTime) {
		motion_actuators_SimpleActuator.prototype.update.call(this,currentTime);
		if(this.active && !this.paused) {
			var _g1 = 0;
			var _g = this.properties.start.length;
			while(_g1 < _g) {
				var i = _g1++;
				this.currentParameters[i] = Reflect.field(this.tweenProperties,"param" + i);
			}
			this.callMethod(this.target,this.currentParameters);
		}
	}
	,__class__: motion_actuators_MethodActuator
});
var motion_actuators_MotionPathActuator = function(target,duration,properties) {
	motion_actuators_SimpleActuator.call(this,target,duration,properties);
};
motion_actuators_MotionPathActuator.__name__ = true;
motion_actuators_MotionPathActuator.__super__ = motion_actuators_SimpleActuator;
motion_actuators_MotionPathActuator.prototype = $extend(motion_actuators_SimpleActuator.prototype,{
	apply: function() {
		var _g = 0;
		var _g1 = Reflect.fields(this.properties);
		while(_g < _g1.length) {
			var propertyName = _g1[_g];
			++_g;
			if(Object.prototype.hasOwnProperty.call(this.target,propertyName)) Reflect.setField(this.target,propertyName,(js_Boot.__cast(Reflect.field(this.properties,propertyName) , motion_IComponentPath)).get_end()); else Reflect.setProperty(this.target,propertyName,(js_Boot.__cast(Reflect.field(this.properties,propertyName) , motion_IComponentPath)).get_end());
		}
	}
	,initialize: function() {
		var details;
		var path;
		var _g = 0;
		var _g1 = Reflect.fields(this.properties);
		while(_g < _g1.length) {
			var propertyName = _g1[_g];
			++_g;
			path = js_Boot.__cast(Reflect.field(this.properties,propertyName) , motion_IComponentPath);
			if(path != null) {
				var isField = true;
				if(Object.prototype.hasOwnProperty.call(this.target,propertyName)) path.start = Reflect.field(this.target,propertyName); else {
					isField = false;
					path.start = Reflect.getProperty(this.target,propertyName);
				}
				details = new motion_actuators_PropertyPathDetails(this.target,propertyName,path,isField);
				this.propertyDetails.push(details);
			}
		}
		this.detailsLength = this.propertyDetails.length;
		this.initialized = true;
	}
	,update: function(currentTime) {
		if(!this.paused) {
			var details;
			var easing;
			var tweenPosition = (currentTime - this.timeOffset) / this.duration;
			if(tweenPosition > 1) tweenPosition = 1;
			if(!this.initialized) this.initialize();
			if(!this.special) {
				easing = this._ease.calculate(tweenPosition);
				var _g = 0;
				var _g1 = this.propertyDetails;
				while(_g < _g1.length) {
					var details1 = _g1[_g];
					++_g;
					if(details1.isField) Reflect.setField(details1.target,details1.propertyName,(js_Boot.__cast(details1 , motion_actuators_PropertyPathDetails)).path.calculate(easing)); else Reflect.setProperty(details1.target,details1.propertyName,(js_Boot.__cast(details1 , motion_actuators_PropertyPathDetails)).path.calculate(easing));
				}
			} else {
				if(!this._reverse) easing = this._ease.calculate(tweenPosition); else easing = this._ease.calculate(1 - tweenPosition);
				var endValue;
				var _g2 = 0;
				var _g11 = this.propertyDetails;
				while(_g2 < _g11.length) {
					var details2 = _g11[_g2];
					++_g2;
					if(!this._snapping) {
						if(details2.isField) Reflect.setField(details2.target,details2.propertyName,(js_Boot.__cast(details2 , motion_actuators_PropertyPathDetails)).path.calculate(easing)); else Reflect.setProperty(details2.target,details2.propertyName,(js_Boot.__cast(details2 , motion_actuators_PropertyPathDetails)).path.calculate(easing));
					} else if(details2.isField) Reflect.setField(details2.target,details2.propertyName,Math.round((js_Boot.__cast(details2 , motion_actuators_PropertyPathDetails)).path.calculate(easing))); else Reflect.setProperty(details2.target,details2.propertyName,Math.round((js_Boot.__cast(details2 , motion_actuators_PropertyPathDetails)).path.calculate(easing)));
				}
			}
			if(tweenPosition == 1) {
				if(this._repeat == 0) {
					this.active = false;
					if(this.toggleVisible && this.getField(this.target,"alpha") == 0) this.setField_motion_actuators_MotionPathActuator_T(this.target,"visible",false);
					this.complete(true);
					return;
				} else {
					if(this._onRepeat != null) this.callMethod(this._onRepeat,this._onRepeatParams);
					if(this._reflect) this._reverse = !this._reverse;
					this.startTime = currentTime;
					this.timeOffset = this.startTime + this._delay;
					if(this._repeat > 0) this._repeat--;
				}
			}
			if(this.sendChange) this.change();
		}
	}
	,__class__: motion_actuators_MotionPathActuator
});
var motion_actuators_PropertyDetails = function(target,propertyName,start,change,isField) {
	if(isField == null) isField = true;
	this.target = target;
	this.propertyName = propertyName;
	this.start = start;
	this.change = change;
	this.isField = isField;
};
motion_actuators_PropertyDetails.__name__ = true;
motion_actuators_PropertyDetails.prototype = {
	__class__: motion_actuators_PropertyDetails
};
var motion_actuators_PropertyPathDetails = function(target,propertyName,path,isField) {
	if(isField == null) isField = true;
	motion_actuators_PropertyDetails.call(this,target,propertyName,0,0,isField);
	this.path = path;
};
motion_actuators_PropertyPathDetails.__name__ = true;
motion_actuators_PropertyPathDetails.__super__ = motion_actuators_PropertyDetails;
motion_actuators_PropertyPathDetails.prototype = $extend(motion_actuators_PropertyDetails.prototype,{
	__class__: motion_actuators_PropertyPathDetails
});
var motion_easing_ExpoEaseIn = function() {
};
motion_easing_ExpoEaseIn.__name__ = true;
motion_easing_ExpoEaseIn.__interfaces__ = [motion_easing_IEasing];
motion_easing_ExpoEaseIn.prototype = {
	calculate: function(k) {
		if(k == 0) return 0; else return Math.pow(2,10 * (k - 1));
	}
	,ease: function(t,b,c,d) {
		if(t == 0) return b; else return c * Math.pow(2,10 * (t / d - 1)) + b;
	}
	,__class__: motion_easing_ExpoEaseIn
};
var motion_easing_ExpoEaseInOut = function() {
};
motion_easing_ExpoEaseInOut.__name__ = true;
motion_easing_ExpoEaseInOut.__interfaces__ = [motion_easing_IEasing];
motion_easing_ExpoEaseInOut.prototype = {
	calculate: function(k) {
		if(k == 0) return 0;
		if(k == 1) return 1;
		if((k /= 0.5) < 1.0) return 0.5 * Math.pow(2,10 * (k - 1));
		return 0.5 * (2 - Math.pow(2,-10 * --k));
	}
	,ease: function(t,b,c,d) {
		if(t == 0) return b;
		if(t == d) return b + c;
		if((t /= d / 2.0) < 1.0) return c / 2 * Math.pow(2,10 * (t - 1)) + b;
		return c / 2 * (2 - Math.pow(2,-10 * --t)) + b;
	}
	,__class__: motion_easing_ExpoEaseInOut
};
var sdf_generator_SDFMaker = function(renderer) {
	this.texLevels = 256.0;
	this.renderer = renderer;
	this.scene = new THREE.Scene();
	this.scene.add(new THREE.Mesh(new THREE.PlaneGeometry(1,1)));
	this.camera = new THREE.OrthographicCamera(-0.5,0.5,0.5,-0.5,-1,1);
	this.camera.updateProjectionMatrix();
	this.blurMaterial = new THREE.ShaderMaterial({ vertexShader : sdf_shaders_GaussianBlur.vertexShader, fragmentShader : sdf_shaders_GaussianBlur.fragmentShader, uniforms : sdf_shaders_GaussianBlur.uniforms});
	this.seedMaterial = new THREE.ShaderMaterial({ vertexShader : sdf_shaders_EDT_$SEED.vertexShader, fragmentShader : sdf_shaders_EDT_$SEED.fragmentShader, uniforms : sdf_shaders_EDT_$SEED.uniforms, transparent : true});
	this.floodMaterial = new THREE.ShaderMaterial({ vertexShader : sdf_shaders_EDT_$FLOOD.vertexShader, fragmentShader : sdf_shaders_EDT_$FLOOD.fragmentShader, uniforms : sdf_shaders_EDT_$FLOOD.uniforms});
	this.renderTargetParams = { minFilter : THREE.NearestFilter, magFilter : THREE.NearestFilter, wrapS : THREE.ClampToEdgeWrapping, wrapT : THREE.ClampToEdgeWrapping, format : THREE.RGBAFormat, stencilBuffer : false, depthBuffer : false, type : THREE.UnsignedByteType};
};
sdf_generator_SDFMaker.__name__ = true;
sdf_generator_SDFMaker.prototype = {
	transformTexture: function(texture,blurInput) {
		if(blurInput == null) blurInput = true;
		var width = texture.image.width;
		var height = texture.image.height;
		var ping = new THREE.WebGLRenderTarget(width,height,this.renderTargetParams);
		var pong = new THREE.WebGLRenderTarget(width,height,this.renderTargetParams);
		if(blurInput) {
			this.scene.overrideMaterial = this.blurMaterial;
			this.blurMaterial.uniforms.resolution.value.set(width,height);
			this.blurMaterial.uniforms.tDiffuse.value = texture;
			this.blurMaterial.uniforms.direction.value.set(1,0);
			texture.minFilter = THREE.LinearFilter;
			texture.magFilter = THREE.LinearFilter;
			texture.wrapS = THREE.RepeatWrapping;
			texture.wrapT = THREE.RepeatWrapping;
			this.renderer.render(this.scene,this.camera,ping,true);
			texture.wrapS = THREE.ClampToEdgeWrapping;
			texture.wrapT = THREE.ClampToEdgeWrapping;
			texture.minFilter = THREE.NearestFilter;
			texture.magFilter = THREE.NearestFilter;
			this.blurMaterial.uniforms.tDiffuse.value = ping;
			this.blurMaterial.uniforms.direction.value.set(0,1);
			ping.minFilter = THREE.LinearFilter;
			ping.magFilter = THREE.LinearFilter;
			ping.wrapS = THREE.RepeatWrapping;
			ping.wrapT = THREE.RepeatWrapping;
			this.renderer.render(this.scene,this.camera,pong,true);
			ping.wrapS = THREE.ClampToEdgeWrapping;
			ping.wrapT = THREE.ClampToEdgeWrapping;
			ping.minFilter = THREE.NearestFilter;
			ping.magFilter = THREE.NearestFilter;
		}
		this.scene.overrideMaterial = this.seedMaterial;
		if(blurInput) this.seedMaterial.uniforms.tDiffuse.value = pong; else this.seedMaterial.uniforms.tDiffuse.value = texture;
		this.seedMaterial.uniforms.texLevels.value = this.texLevels;
		this.renderer.render(this.scene,this.camera,ping,true);
		this.scene.overrideMaterial = this.floodMaterial;
		this.floodMaterial.uniforms.texLevels.value = this.texLevels;
		this.floodMaterial.uniforms.texw.value = width;
		this.floodMaterial.uniforms.texh.value = height;
		var stepSize;
		if(width > height) stepSize = width / 2 | 0; else stepSize = height / 2 | 0;
		var last = ping;
		while(stepSize > 0) {
			this.floodMaterial.uniforms.tDiffuse.value = last;
			this.floodMaterial.uniforms.step.value = stepSize;
			if(last == ping) last = pong; else last = ping;
			this.renderer.render(this.scene,this.camera,last,true);
			stepSize = stepSize / 2 | 0;
		}
		this.scene.overrideMaterial = null;
		if(last != ping) ping.dispose();
		if(last != pong) pong.dispose();
		return last;
	}
	,__class__: sdf_generator_SDFMaker
};
var sdf_shaders_Copy = function() { };
sdf_shaders_Copy.__name__ = true;
var sdf_shaders_EDT_$SEED = function() { };
sdf_shaders_EDT_$SEED.__name__ = true;
var sdf_shaders_EDT_$FLOOD = function() { };
sdf_shaders_EDT_$FLOOD.__name__ = true;
var sdf_shaders_EDT_$DISPLAY_$AA = function() { };
sdf_shaders_EDT_$DISPLAY_$AA.__name__ = true;
var sdf_shaders_EDT_$DISPLAY_$OVERLAY = function() { };
sdf_shaders_EDT_$DISPLAY_$OVERLAY.__name__ = true;
var sdf_shaders_EDT_$DISPLAY_$RGB = function() { };
sdf_shaders_EDT_$DISPLAY_$RGB.__name__ = true;
var sdf_shaders_EDT_$DISPLAY_$GRAYSCALE = function() { };
sdf_shaders_EDT_$DISPLAY_$GRAYSCALE.__name__ = true;
var sdf_shaders_EDT_$DISPLAY_$ALPHA_$THRESHOLD = function() { };
sdf_shaders_EDT_$DISPLAY_$ALPHA_$THRESHOLD.__name__ = true;
var sdf_shaders_GaussianBlur = function() { };
sdf_shaders_GaussianBlur.__name__ = true;
var shaders_EDT_$DISPLAY_$DEMO = function() { };
shaders_EDT_$DISPLAY_$DEMO.__name__ = true;
var shaders_FXAA = function() { };
shaders_FXAA.__name__ = true;
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
Main.REPO_URL = "https://github.com/Tw1ddle/WebGL-Distance-Fields";
Main.WEBSITE_URL = "http://samcodes.co.uk/";
Main.TWITTER_URL = "https://twitter.com/Sam_Twidale";
Main.HAXE_URL = "http://haxe.org/";
Main.lastAnimationTime = 0.0;
Main.dt = 0.0;
dat_ThreeObjectGUI.guiItemCount = 0;
haxe_ds_ObjectMap.count = 0;
js_Boot.__toStr = {}.toString;
motion_actuators_SimpleActuator.actuators = [];
motion_actuators_SimpleActuator.actuatorsLength = 0;
motion_actuators_SimpleActuator.addedEvent = false;
motion_Actuate.defaultActuator = motion_actuators_SimpleActuator;
motion_Actuate.defaultEase = motion_easing_Expo.get_easeOut();
motion_Actuate.targetLibraries = new haxe_ds_ObjectMap();
sdf_shaders_Copy.uniforms = { tDiffuse : { type : "t", value : null}};
sdf_shaders_Copy.vertexShader = "varying vec2 vUv;\r\n\r\nvoid main()\r\n{\r\n\tvUv = uv;\r\n\tgl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);\r\n}";
sdf_shaders_Copy.fragmentShader = "varying vec2 vUv;\r\n\r\nuniform sampler2D tDiffuse;\r\n\r\nvoid main()\r\n{\r\n\tgl_FragColor = texture2D(tDiffuse, vUv);\r\n}";
sdf_shaders_EDT_$SEED.uniforms = { tDiffuse : { type : "t", value : null}, texLevels : { type : "f", value : 0.0}};
sdf_shaders_EDT_$SEED.vertexShader = "varying vec2 vUv;\r\n\r\nvoid main()\r\n{\r\n\tvUv = uv;\r\n\tgl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);\r\n}";
sdf_shaders_EDT_$SEED.fragmentShader = "// Jump flooding algorithm for Euclidean distance transform, according to Danielsson (1980) and Guodong Rong (2007).\r\n// This shader initializes the distance field in preparation for the flood filling.\r\n\r\n// Adapted for three.js demo by Sam Twidale.\r\n// Original implementation by Stefan Gustavson 2010.\r\n// This code is in the public domain.\r\n\r\nvarying vec2 vUv;\r\n\r\nuniform sampler2D tDiffuse;\r\nuniform float texLevels;\r\n\r\nvoid main()\r\n{\r\n\tfloat texel = texture2D(tDiffuse, vUv).r;\r\n\t\r\n\t// Represents zero\r\n\tfloat myzero = 0.5 * texLevels / (texLevels - 1.0);\r\n\t\r\n\t// Represents infinity/not-yet-calculated\r\n\tfloat myinfinity = 0.0;\r\n\t\r\n\t// Sub-pixel AA distance\r\n\tfloat aadist = texel;\r\n\t\r\n\t// Pixels > 0.5 are objects, others are background\r\n\tgl_FragColor = vec4(vec2(texel > 0.99999 ? myinfinity : myzero), aadist, 1.0);\r\n}";
sdf_shaders_EDT_$FLOOD.uniforms = { tDiffuse : { type : "t", value : null}, texLevels : { type : "f", value : 0.0}, texw : { type : "f", value : 0.0}, texh : { type : "f", value : 0.0}, step : { type : "f", value : 0.0}};
sdf_shaders_EDT_$FLOOD.vertexShader = "// Jump flooding algorithm for Euclidean distance transform, according to Danielsson (1980) and Guodong Rong (2007).\r\n// This code represents one iteration of the flood filling.\r\n// You need to run it multiple times with different step lengths to perform a full distance transformation.\r\n\r\n// Adapted for three.js demo by Sam Twidale.\r\n// Original implementation by Stefan Gustavson 2010.\r\n// This code is in the public domain.\r\n\r\nvarying vec2 vUv;\r\nvarying float stepu;\r\nvarying float stepv;\r\n\r\nuniform float step;\r\nuniform float texw;\r\nuniform float texh;\r\n\r\nvoid main()\r\n{\r\n\t// Saves a division in the fragment shader\r\n\tstepu = step / texw;\r\n\tstepv = step / texh;\r\n\t\r\n\tvUv = uv;\t\r\n\tgl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);\r\n}";
sdf_shaders_EDT_$FLOOD.fragmentShader = "// Jump flooding algorithm for Euclidean distance transform, according to Danielsson (1980) and Guodong Rong (2007).\r\n// This code represents one iteration of the flood filling.\r\n// You need to run it multiple times with different step lengths to perform a full distance transformation.\r\n\r\n// Adapted for three.js demo by Sam Twidale.\r\n// Original implementation by Stefan Gustavson 2010.\r\n// This code is in the public domain.\r\n\r\nvarying vec2 vUv;\r\nvarying float stepu;\r\nvarying float stepv;\r\n\r\nuniform sampler2D tDiffuse;\r\nuniform float texw;\r\nuniform float texh;\r\nuniform float texLevels;\r\n\r\n// Helper function to remap unsigned normalized floats [0.0..1.0]\r\n// coming from a texture stored in integer format internally to a\r\n// signed float vector pointing exactly to a pixel centre in texture\r\n// space. The range of valid vectors is\r\n// [-1.0+0.5/texsize, 1.0-0.5/texsize], with the special value\r\n// -1.0-0.5*texsize (represented as integer 0) meaning\r\n// \"distance vector still undetermined\".\r\n// The mapping is carefully designed to map both 8 bit and 16\r\n// bit integer texture data to distinct and exact floating point\r\n// texture coordinate offsets and vice versa.\r\n// 8 bit integer textures can be used to transform images up to\r\n// size 128x128 pixels, and 16 bit integer textures can be used to\r\n// transform images up to 32768x32768, i.e. beyond the largest\r\n// texture size available in current implementations of OpenGL.\r\n// Direct use of integers in the shader (by means of texture2DRect\r\n// and GL_RG8I and GL_RG16I texture formats) could be faster, but-1\r\n// this code is conveniently compatible even with version 1.2 of GLSL\r\n// (i.e. OpenGL 2.1), and the main shader is limited by texture access\r\n// and branching, not ALU capacity, so a few extra multiplications\r\n// for indexing and output storage are not that bad.\r\nvec2 remap(vec2 floatdata)\r\n{\r\n     return floatdata * (texLevels - 1.0) / texLevels * 2.0 - 1.0;\r\n}\r\n\r\nvec2 remap_inv(vec2 floatvec)\r\n{\r\n     return (floatvec + 1.0) * 0.5 * texLevels / (texLevels - 1.0);\r\n}\r\n\r\n// TODO this isn't ideal, also will it work for most texture sizes?\r\nvec3 sampleTexture(sampler2D texture, vec2 vec)\r\n{\r\n\t// The algorithm depends on the texture having a CLAMP_TO_BORDER attribute and a border color with R = 0.\r\n\t// These explicit conditionals to avoid propagating incorrect vectors when looking outside of [0,1] in UV cause a slowdown of about 25%.\r\n\tif(vec.x >= 1.0 || vec.y >= 1.0 || vec.x <= 0.0 || vec.y <= 0.0)\r\n\t{\r\n\t\tvec = clamp(vec, 0.0, 1.0);\r\n\t\treturn vec3(0.0, 0.0, 0.0);\r\n\t}\r\n\t\r\n\treturn texture2D(texture, vec).rgb;\r\n}\r\n\r\nvoid testCandidate(in vec2 stepvec, inout vec4 bestseed)\r\n{\r\n\tvec2 newvec = vUv + stepvec; // Absolute position of that candidate\r\n\tvec3 texel = sampleTexture(tDiffuse, newvec).rgb;\r\n\tvec4 newseed; // Closest point from that candidate (xy), its AA distance (z) and its grayscale value (w)\r\n\tnewseed.xy = remap(texel.rg);\r\n\tif(newseed.x > -0.99999) // If the new seed is not \"indeterminate distance\"\r\n\t{\r\n\t\tnewseed.xy = newseed.xy + stepvec;\r\n\t\t\r\n\t\t// TODO: implement better equations for calculating the AA distance\r\n\t\t// Try by getting the direction of the edge using the gradients of nearby edge pixels \r\n\t\t\r\n\t\tfloat di = length(newseed.xy);\r\n\t\tfloat df = texel.b - 0.5;\r\n\t\t\r\n\t\t// TODO: This AA assumes texw == texh. It does not allow for non-square textures.\r\n\t\tnewseed.z = di + (df / texw);\r\n\t\tnewseed.w = texel.b;\r\n\t\t\r\n\t\tif(newseed.z < bestseed.z)\r\n\t\t{\r\n\t\t\tbestseed = newseed;\r\n\t\t}\r\n\t}\r\n}\r\n\r\nvoid main()\r\n{\r\n\t// Searches for better distance vectors among 8 candidates\r\n\tvec3 texel = sampleTexture(tDiffuse, vUv).rgb;\r\n\t\r\n\t// Closest seed so far\r\n\tvec4 bestseed;\r\n\tbestseed.xy = remap(texel.rg);\r\n\tbestseed.z = length(bestseed.xy) + (texel.b - 0.5) / texw; // Add AA edge offset to distance\r\n\tbestseed.w = texel.b; // Save AA/grayscale value\r\n\t\r\n\ttestCandidate(vec2(-stepu, -stepv), bestseed);\r\n\ttestCandidate(vec2(-stepu, 0.0), bestseed);\r\n\ttestCandidate(vec2(-stepu, stepv), bestseed);\r\n\ttestCandidate(vec2(0.0, -stepv), bestseed);\r\n\ttestCandidate(vec2(0.0, stepv), bestseed);\r\n\ttestCandidate(vec2(stepu, -stepv), bestseed);\r\n\ttestCandidate(vec2(stepu, 0.0), bestseed);\r\n\ttestCandidate(vec2(stepu, stepv), bestseed);\r\n\t\r\n\tgl_FragColor = vec4(remap_inv(bestseed.xy), bestseed.w, 1.0);\r\n}";
sdf_shaders_EDT_$DISPLAY_$AA.uniforms = { tDiffuse : { type : "t", value : null}, texw : { type : "f", value : 0.0}, texh : { type : "f", value : 0.0}, texLevels : { type : "f", value : 0.0}, threshold : { type : "f", value : 0.0, min : 0.0, max : 1.0}};
sdf_shaders_EDT_$DISPLAY_$AA.vertexShader = "// Adapted for three.js demo by Sam Twidale.\r\n// Original implementation by Stefan Gustavson 2010.\r\n// This code is in the public domain.\r\n\r\nvarying vec2 vUv;\r\nvarying float oneu;\r\nvarying float onev;\r\n\r\nuniform float texw;\r\nuniform float texh;\r\n\r\nvoid main()\r\n{\r\n\tvUv = uv;\r\n\t\r\n\t// Save divisions in some of the fragment shaders\r\n\toneu = 1.0 / texw;\r\n\tonev = 1.0 / texh;\r\n\t\r\n\tgl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);\r\n}";
sdf_shaders_EDT_$DISPLAY_$AA.fragmentShader = "// Distance map contour texturing.\r\n// A reimplementation of Greens method, with a 16-bit 8:8 distance map and explicit bilinear interpolation.\r\n\r\n// Adapted for three.js demo by Sam Twidale.\r\n// Original implementation by Stefan Gustavson 2011.\r\n// This code is in the public domain.\r\n\r\nvarying vec2 vUv;\r\nvarying float oneu;\r\nvarying float onev;\r\n\r\nuniform sampler2D tDiffuse;\r\nuniform float texw;\r\nuniform float texh;\r\nuniform float texLevels;\r\nuniform float threshold;\r\n\r\n// Replacement for RSLs filterstep(), with fwidth() done right.\r\n// threshold is constant, value is smoothly varying\r\nfloat aastep(float threshold, float value)\r\n{\r\n\tfloat afwidth = 0.7 * length(vec2(dFdx(value), dFdy(value)));\r\n\treturn smoothstep(threshold - afwidth, threshold + afwidth, value); // GLSLs fwidth(value) is abs(dFdx(value)) + abs(dFdy(value))\r\n}\r\n\r\n// Helper functions to remap unsigned normalized floats [0.0, 1.0] coming from an integer texture to the range we need [-1, 1].\r\n// The transformations are very specifically designed to map integer texel values exactly to pixel centers, and vice versa.\r\nvec2 remap(vec2 floatdata)\r\n{\r\n\treturn floatdata * (texLevels - 1.0) / texLevels * 2.0 - 1.0;\r\n}\r\n\r\nvoid main()\r\n{\r\n\t// Scale texcoords to range ([0, texw], [0, texh])\r\n\tvec2 uv = vUv * vec2(texw, texh);\r\n\t\r\n\t// Compute texel-local (u,v) coordinates for the four closest texels\r\n\tvec2 uv00 = floor(uv - vec2(0.5)); // Lower left corner of lower left texel\r\n\tvec2 uvlerp = uv - uv00 - vec2(0.5); // Texel-local lerp blends [0,1]\r\n\t\r\n\t// Center st00 on lower left texel and rescale to [0,1] for texture lookup\r\n\tvec2 st00 = (uv00 + vec2(0.5)) * vec2(oneu, onev);\r\n\t\r\n\t// Compute distance value from four closest 8-bit RGBA texels\r\n\tvec4 T00 = texture2D(tDiffuse, st00);\r\n\tvec4 T10 = texture2D(tDiffuse, st00 + vec2(oneu, 0.0));\r\n\tvec4 T01 = texture2D(tDiffuse, st00 + vec2(0.0, onev));\r\n\tvec4 T11 = texture2D(tDiffuse, st00 + vec2(oneu, onev));\r\n\tfloat D00 = length(remap(T00.rg)) + (T00.b - 0.5) / texw;\r\n\tfloat D10 = length(remap(T10.rg)) + (T10.b - 0.5) / texw;\r\n\tfloat D01 = length(remap(T01.rg)) + (T01.b - 0.5) / texw;\r\n\tfloat D11 = length(remap(T11.rg)) + (T11.b - 0.5) / texw;\r\n\t\r\n\t// Interpolate along v\r\n\tvec2 D0_1 = mix(vec2(D00, D10), vec2(D01, D11), uvlerp.y);\r\n\t\r\n\t// Interpolate along u\r\n\tfloat D = mix(D0_1.x, D0_1.y, uvlerp.x);\r\n\t\r\n\tfloat g = aastep(threshold, D);\r\n\t\r\n\t// Final fragment color\r\n\tgl_FragColor = vec4(vec3(g), 1.0);\r\n}";
sdf_shaders_EDT_$DISPLAY_$OVERLAY.uniforms = { tDiffuse : { type : "t", value : null}, texw : { type : "f", value : 0.0}, texh : { type : "f", value : 0.0}, texLevels : { type : "f", value : 0.0}, threshold : { type : "f", value : 0.0, min : 0.0, max : 1.0}};
sdf_shaders_EDT_$DISPLAY_$OVERLAY.vertexShader = "// Adapted for three.js demo by Sam Twidale.\r\n// Original implementation by Stefan Gustavson 2010.\r\n// This code is in the public domain.\r\n\r\nvarying vec2 vUv;\r\nvarying float oneu;\r\nvarying float onev;\r\n\r\nuniform float texw;\r\nuniform float texh;\r\n\r\nvoid main()\r\n{\r\n\tvUv = uv;\r\n\t\r\n\t// Save divisions in some of the fragment shaders\r\n\toneu = 1.0 / texw;\r\n\tonev = 1.0 / texh;\r\n\t\r\n\tgl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);\r\n}";
sdf_shaders_EDT_$DISPLAY_$OVERLAY.fragmentShader = "// Distance map contour texturing.\r\n// A reimplementation of Greens method, with a 16-bit 8:8 distance map and explicit bilinear interpolation.\r\n\r\n// Adapted for three.js demo by Sam Twidale.\r\n// Original implementation by Stefan Gustavson 2011.\r\n// This code is in the public domain.\r\n\r\nvarying vec2 vUv;\r\nvarying float oneu;\r\nvarying float onev;\r\n\r\nuniform sampler2D tDiffuse;\r\nuniform float texw;\r\nuniform float texh;\r\nuniform float texLevels;\r\nuniform float threshold;\r\n\r\n// Replacement for RSLs filterstep(), with fwidth() done right.\r\n// threshold is constant, value is smoothly varying\r\nfloat aastep(float threshold, float value)\r\n{\r\n\tfloat afwidth = 0.7 * length(vec2(dFdx(value), dFdy(value)));\r\n\treturn smoothstep(threshold - afwidth, threshold + afwidth, value); // GLSLs fwidth(value) is abs(dFdx(value)) + abs(dFdy(value))\r\n}\r\n\r\n// Helper functions to remap unsigned normalized floats [0.0, 1.0] coming from an integer texture to the range we need [-1, 1].\r\n// The transformations are very specifically designed to map integer texel values exactly to pixel centers, and vice versa.\r\nvec2 remap(vec2 floatdata)\r\n{\r\n\treturn floatdata * (texLevels - 1.0) / texLevels * 2.0 - 1.0;\r\n}\r\n\r\nvoid main()\r\n{\r\n\t// Scale texcoords to range ([0, texw], [0, texh])\r\n\tvec2 uv = vUv * vec2(texw, texh);\r\n\t\r\n\t// Compute texel-local (u,v) coordinates for the four closest texels\r\n\tvec2 uv00 = floor(uv - vec2(0.5)); // Lower left corner of lower left texel\r\n\tvec2 uvlerp = uv - uv00 - vec2(0.5); // Texel-local lerp blends [0,1]\r\n\t\r\n\t// Center st00 on lower left texel and rescale to [0,1] for texture lookup\r\n\tvec2 st00 = (uv00 + vec2(0.5)) * vec2(oneu, onev);\r\n\t\r\n\t// Compute distance value from four closest 8-bit RGBA texels\r\n\tvec4 T00 = texture2D(tDiffuse, st00);\r\n\tvec4 T10 = texture2D(tDiffuse, st00 + vec2(oneu, 0.0));\r\n\tvec4 T01 = texture2D(tDiffuse, st00 + vec2(0.0, onev));\r\n\tvec4 T11 = texture2D(tDiffuse, st00 + vec2(oneu, onev));\r\n\tfloat D00 = length(remap(T00.rg)) + (T00.b - 0.5) / texw;\r\n\tfloat D10 = length(remap(T10.rg)) + (T10.b - 0.5) / texw;\r\n\tfloat D01 = length(remap(T01.rg)) + (T01.b - 0.5) / texw;\r\n\tfloat D11 = length(remap(T11.rg)) + (T11.b - 0.5) / texw;\r\n\t\r\n\t// Interpolate along v\r\n\tvec2 D0_1 = mix(vec2(D00, D10), vec2(D01, D11), uvlerp.y);\r\n\t\r\n\t// Interpolate along u\r\n\tfloat D = mix(D0_1.x, D0_1.y, uvlerp.x);\r\n\t\r\n\tfloat g = aastep(threshold, D);\r\n\t\r\n\t// Retrieve the B channel to get the original grayscale image\r\n\tfloat c = texture2D(tDiffuse, vUv).b;\r\n\t\r\n\t// Final fragment color\r\n\tgl_FragColor = vec4(vec3(g, c, g), 1.0);\r\n}";
sdf_shaders_EDT_$DISPLAY_$RGB.uniforms = { tDiffuse : { type : "t", value : null}, texw : { type : "f", value : 0.0}, texh : { type : "f", value : 0.0}, texLevels : { type : "f", value : 0.0}};
sdf_shaders_EDT_$DISPLAY_$RGB.vertexShader = "// Adapted for three.js demo by Sam Twidale.\r\n// Original implementation by Stefan Gustavson 2010.\r\n// This code is in the public domain.\r\n\r\nvarying vec2 vUv;\r\nvarying float oneu;\r\nvarying float onev;\r\n\r\nuniform float texw;\r\nuniform float texh;\r\n\r\nvoid main()\r\n{\r\n\tvUv = uv;\r\n\t\r\n\t// Save divisions in some of the fragment shaders\r\n\toneu = 1.0 / texw;\r\n\tonev = 1.0 / texh;\r\n\t\r\n\tgl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);\r\n}";
sdf_shaders_EDT_$DISPLAY_$RGB.fragmentShader = "// Displays the final distance field visualized as an RGB image.\r\n\r\n// Adapted for three.js demo by Sam Twidale.\r\n// Original implementation by Stefan Gustavson 2010.\r\n// This code is in the public domain.\r\n\r\nvarying vec2 vUv;\r\n\r\nuniform sampler2D tDiffuse;\r\nuniform float texw;\r\nuniform float texh;\r\nuniform float texLevels;\r\n\r\n// Helper functions to remap unsigned normalized floats [0.0, 1.0] coming from an integer texture to the range we need [-1, 1].\r\n// The transformations are very specifically designed to map integer texel values exactly to pixel centers, and vice versa.\r\nvec2 remap(vec2 floatdata)\r\n{\r\n\treturn floatdata * (texLevels - 1.0) / texLevels * 2.0 - 1.0;\r\n}\r\n\r\nvoid main()\r\n{\r\n\tvec3 texel = texture2D(tDiffuse, vUv).rgb;\r\n\tvec2 distvec = remap(texel.rg);\r\n\t\r\n    //vec2 rainbow = 0.5 + 0.5 * (normalize(distvec));\r\n    //gl_FragColor = vec4(rainbow, 1.0 - (length(distvec) + texel.b - 0.5) * 4.0, 1.0);\r\n\t\r\n\tfloat dist = length(distvec) + (texel.b - 0.5) / texw;\r\n\tgl_FragColor = vec4(vec2(mod(10.0 * dist, 1.0)), texel.b, 1.0);\r\n}";
sdf_shaders_EDT_$DISPLAY_$GRAYSCALE.uniforms = { tDiffuse : { type : "t", value : null}, texw : { type : "f", value : 0.0}, texh : { type : "f", value : 0.0}, texLevels : { type : "f", value : 0.0}, distanceFactor : { type : "f", value : 30.0}};
sdf_shaders_EDT_$DISPLAY_$GRAYSCALE.vertexShader = "// Adapted for three.js demo by Sam Twidale.\r\n// Original implementation by Stefan Gustavson 2010.\r\n// This code is in the public domain.\r\n\r\nvarying vec2 vUv;\r\nvarying float oneu;\r\nvarying float onev;\r\n\r\nuniform float texw;\r\nuniform float texh;\r\n\r\nvoid main()\r\n{\r\n\tvUv = uv;\r\n\t\r\n\t// Save divisions in some of the fragment shaders\r\n\toneu = 1.0 / texw;\r\n\tonev = 1.0 / texh;\r\n\t\r\n\tgl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);\r\n}";
sdf_shaders_EDT_$DISPLAY_$GRAYSCALE.fragmentShader = "// This code is in the public domain.\r\n\r\nvarying vec2 vUv;\r\nvarying float oneu;\r\nvarying float onev;\r\n\r\nuniform sampler2D tDiffuse;\r\nuniform float texw;\r\nuniform float texh;\r\nuniform float texLevels;\r\nuniform float threshold;\r\nuniform float distanceFactor;\r\n\r\n// Helper functions to remap unsigned normalized floats [0.0, 1.0] coming from an integer texture to the range we need [-1, 1].\r\n// The transformations are very specifically designed to map integer texel values exactly to pixel centers, and vice versa.\r\nvec2 remap(vec2 floatdata)\r\n{\r\n\treturn floatdata * (texLevels - 1.0) / texLevels * 2.0 - 1.0;\r\n}\r\n\r\nvoid main()\r\n{\r\n\t// Scale texcoords to range ([0, texw], [0, texh])\r\n\tvec2 uv = vUv * vec2(texw, texh);\r\n\t\r\n\t// Compute texel-local (u,v) coordinates for the four closest texels\r\n\tvec2 uv00 = floor(uv - vec2(0.5)); // Lower left corner of lower left texel\r\n\tvec2 uvlerp = uv - uv00 - vec2(0.5); // Texel-local lerp blends [0,1]\r\n\t\r\n\t// Center st00 on lower left texel and rescale to [0,1] for texture lookup\r\n\tvec2 st00 = (uv00 + vec2(0.5)) * vec2(oneu, onev);\r\n\t\r\n\t// Compute distance value from four closest 8-bit RGBA texels\r\n\tvec4 T00 = texture2D(tDiffuse, st00);\r\n\tvec4 T10 = texture2D(tDiffuse, st00 + vec2(oneu, 0.0));\r\n\tvec4 T01 = texture2D(tDiffuse, st00 + vec2(0.0, onev));\r\n\tvec4 T11 = texture2D(tDiffuse, st00 + vec2(oneu, onev));\r\n\tfloat D00 = length(remap(T00.rg)) + (T00.b - 0.5) / texw;\r\n\tfloat D10 = length(remap(T10.rg)) + (T10.b - 0.5) / texw;\r\n\tfloat D01 = length(remap(T01.rg)) + (T01.b - 0.5) / texw;\r\n\tfloat D11 = length(remap(T11.rg)) + (T11.b - 0.5) / texw;\r\n\t\r\n\t// Interpolate along v\r\n\tvec2 D0_1 = mix(vec2(D00, D10), vec2(D01, D11), uvlerp.y);\r\n\t\r\n\t// Interpolate along u\r\n\tfloat D = mix(D0_1.x, D0_1.y, uvlerp.x) * distanceFactor;\r\n\t\r\n\t// Final fragment color\r\n\tgl_FragColor = vec4(vec3(D), 1.0);\r\n}";
sdf_shaders_EDT_$DISPLAY_$ALPHA_$THRESHOLD.uniforms = { tDiffuse : { type : "t", value : null}, texw : { type : "f", value : 0.0}, texh : { type : "f", value : 0.0}, texLevels : { type : "f", value : 0.0}, threshold : { type : "f", value : 0.0, min : 0.0, max : 1.0}};
sdf_shaders_EDT_$DISPLAY_$ALPHA_$THRESHOLD.vertexShader = "// Adapted for three.js demo by Sam Twidale.\r\n// Original implementation by Stefan Gustavson 2010.\r\n// This code is in the public domain.\r\n\r\nvarying vec2 vUv;\r\nvarying float oneu;\r\nvarying float onev;\r\n\r\nuniform float texw;\r\nuniform float texh;\r\n\r\nvoid main()\r\n{\r\n\tvUv = uv;\r\n\t\r\n\t// Save divisions in some of the fragment shaders\r\n\toneu = 1.0 / texw;\r\n\tonev = 1.0 / texh;\r\n\t\r\n\tgl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);\r\n}";
sdf_shaders_EDT_$DISPLAY_$ALPHA_$THRESHOLD.fragmentShader = "// Distance map contour texturing.\r\n// Simple alpha thresholding, produces wavey contours.\r\n\r\n// Adapted for three.js demo by Sam Twidale.\r\n// Original implementation by Stefan Gustavson 2011.\r\n// This code is in the public domain.\r\n\r\nvarying vec2 vUv;\r\nvarying float oneu;\r\nvarying float onev;\r\n\r\nuniform sampler2D tDiffuse;\r\nuniform float texw;\r\nuniform float texh;\r\nuniform float texLevels;\r\nuniform float threshold;\r\n\r\n// Replacement for RSLs filterstep(), with fwidth() done right.\r\n// threshold is constant, value is smoothly varying\r\nfloat aastep(float threshold, float value)\r\n{\r\n\tfloat afwidth = 0.7 * length(vec2(dFdx(value), dFdy(value)));\r\n\treturn smoothstep(threshold - afwidth, threshold + afwidth, value); // GLSLs fwidth(value) is abs(dFdx(value)) + abs(dFdy(value))\r\n}\r\n\r\nvoid main()\r\n{\r\n\t// Scale texcoords to range ([0, texw], [0, texh])\r\n\tvec2 uv = vUv * vec2(texw, texh);\r\n\t\r\n\t// Compute texel-local (u,v) coordinates for the four closest texels\r\n\tvec2 uv00 = floor(uv - vec2(0.5)); // Lower left corner of lower left texel\r\n\tvec2 uvlerp = uv - uv00 - vec2(0.5); // Texel-local lerp blends [0,1]\r\n\t\r\n\t// Center st00 on lower left texel and rescale to [0,1] for texture lookup\r\n\tvec2 st00 = (uv00 + vec2(0.5)) * vec2(oneu, onev);\r\n\t\r\n\t// Compute distance value from four closest 8-bit RGBA texels\r\n\tvec4 D00 = texture2D(tDiffuse, st00);\r\n\tvec4 D10 = texture2D(tDiffuse, st00 + vec2(oneu, 0.0));\r\n\tvec4 D01 = texture2D(tDiffuse, st00 + vec2(0.0, onev));\r\n\tvec4 D11 = texture2D(tDiffuse, st00 + vec2(oneu, onev));\r\n\r\n\t// Retrieve the B channel to get the original grayscale image\r\n\tvec4 G = vec4(D00.b, D01.b, D10.b, D11.b);\r\n  \r\n\t// Interpolate along v\r\n\tG.xy = mix(G.xz, G.yw, uvlerp.y);\r\n\r\n\t// Interpolate along u\r\n\tfloat g = mix(G.x, G.y, uvlerp.x);\r\n\r\n\tfloat c = aastep(threshold, g);\r\n\t\r\n\t// Final fragment color\r\n\tgl_FragColor = vec4(vec3(c), 1.0);\r\n}";
sdf_shaders_GaussianBlur.uniforms = { tDiffuse : { type : "t", value : null}, direction : { type : "v2", value : new THREE.Vector2(0,0)}, resolution : { type : "v2", value : new THREE.Vector2(1024.0,1024.0)}, flip : { type : "i", value : 0}};
sdf_shaders_GaussianBlur.vertexShader = "varying vec2 vUv;\r\n\r\nvoid main()\r\n{\r\n\tvUv = uv;\r\n\tgl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);\r\n}";
sdf_shaders_GaussianBlur.fragmentShader = "// Efficient Gaussian blur with linear sampling, based on https://github.com/Jam3/glsl-fast-gaussian-blur by Jam3\r\n// Also see http://rastergrid.com/blog/2010/09/efficient-gaussian-blur-with-linear-sampling/ by Daniel Rakos\r\n// Must use on a texture that has linear (gl.LINEAR) filtering, the linear sampling approach requires this to get info about two adjacent pixels from one texture read, making it faster than discrete sampling\r\n// Requires a horizontal and vertical pass to perform the full blur. It is written this way because a single pass involves many more texture reads\r\n\r\nvarying vec2 vUv;\r\n\r\nuniform sampler2D tDiffuse;\r\nuniform vec2 resolution;\r\nuniform vec2 direction;\r\nuniform int flip;\r\n\r\nvoid main()\r\n{\r\n\tvec2 uv = vUv;\r\n\t\r\n\tif(flip != 0)\r\n\t{\r\n\t\tuv.y = 1.0 - uv.y;\r\n\t}\r\n\t\r\n\tvec2 offset = vec2(1.3333333333333333) * direction;\r\n\tvec4 color = vec4(0.0);\r\n\tcolor += texture2D(tDiffuse, uv) * 0.29411764705882354;\r\n\tcolor += texture2D(tDiffuse, uv + (offset / resolution)) * 0.35294117647058826;\r\n\tcolor += texture2D(tDiffuse, uv - (offset / resolution)) * 0.35294117647058826;\r\n\tgl_FragColor = color;\r\n}";
shaders_EDT_$DISPLAY_$DEMO.uniforms = { tDiffuse : { type : "t", value : null}, texw : { type : "f", value : 0.0}, texh : { type : "f", value : 0.0}, texLevels : { type : "f", value : 0.0}, alpha : { type : "f", value : 1.0}, threshold : { type : "f", value : 0.0, min : 0.0, max : 1.0}, color : { type : "v3", value : new THREE.Vector3(0.0,0.0,1.0)}};
shaders_EDT_$DISPLAY_$DEMO.vertexShader = "// Adapted for three.js demo by Sam Twidale.\r\n// Original implementation by Stefan Gustavson 2010.\r\n// This code is in the public domain.\r\n\r\nvarying vec2 vUv;\r\nvarying float oneu;\r\nvarying float onev;\r\n\r\nuniform float texw;\r\nuniform float texh;\r\n\r\nvoid main()\r\n{\r\n\tvUv = uv;\r\n\t\r\n\t// Save divisions in some of the fragment shaders\r\n\toneu = 1.0 / texw;\r\n\tonev = 1.0 / texh;\r\n\t\r\n\tgl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);\r\n}";
shaders_EDT_$DISPLAY_$DEMO.fragmentShader = "// Distance map contour texturing.\r\n// A reimplementation of Greens method, with a 16-bit 8:8 distance map and explicit bilinear interpolation.\r\n\r\n// Adapted for three.js demo by Sam Twidale.\r\n// Original implementation by Stefan Gustavson 2011.\r\n// This code is in the public domain.\r\n\r\nvarying vec2 vUv;\r\nvarying float oneu;\r\nvarying float onev;\r\n\r\nuniform sampler2D tDiffuse;\r\nuniform float texw;\r\nuniform float texh;\r\nuniform float texLevels;\r\nuniform float threshold;\r\nuniform float alpha;\r\nuniform vec3 color;\r\n\r\n// Replacement for RSLs filterstep(), with fwidth() done right.\r\n// threshold is constant, value is smoothly varying\r\nfloat aastep(float threshold, float value)\r\n{\r\n\tfloat afwidth = 0.7 * length(vec2(dFdx(value), dFdy(value)));\r\n\treturn smoothstep(threshold - afwidth, threshold + afwidth, value); // GLSLs fwidth(value) is abs(dFdx(value)) + abs(dFdy(value))\r\n}\r\n\r\n// Helper functions to remap unsigned normalized floats [0.0, 1.0] coming from an integer texture to the range we need [-1, 1].\r\n// The transformations are very specifically designed to map integer texel values exactly to pixel centers, and vice versa.\r\nvec2 remap(vec2 floatdata)\r\n{\r\n\treturn floatdata * (texLevels - 1.0) / texLevels * 2.0 - 1.0;\r\n}\r\n\r\nvoid main()\r\n{\r\n\t// Scale texcoords to range ([0, texw], [0, texh])\r\n\tvec2 uv = vUv * vec2(texw, texh);\r\n\t\r\n\t// Compute texel-local (u,v) coordinates for the four closest texels\r\n\tvec2 uv00 = floor(uv - vec2(0.5)); // Lower left corner of lower left texel\r\n\tvec2 uvlerp = uv - uv00 - vec2(0.5); // Texel-local lerp blends [0,1]\r\n\t\r\n\t// Center st00 on lower left texel and rescale to [0,1] for texture lookup\r\n\tvec2 st00 = (uv00 + vec2(0.5)) * vec2(oneu, onev);\r\n\t\r\n\t// Compute distance value from four closest 8-bit RGBA texels\r\n\tvec4 T00 = texture2D(tDiffuse, st00);\r\n\tvec4 T10 = texture2D(tDiffuse, st00 + vec2(oneu, 0.0));\r\n\tvec4 T01 = texture2D(tDiffuse, st00 + vec2(0.0, onev));\r\n\tvec4 T11 = texture2D(tDiffuse, st00 + vec2(oneu, onev));\r\n\tfloat D00 = length(remap(T00.rg)) + (T00.b - 0.5) / texw;\r\n\tfloat D10 = length(remap(T10.rg)) + (T10.b - 0.5) / texw;\r\n\tfloat D01 = length(remap(T01.rg)) + (T01.b - 0.5) / texw;\r\n\tfloat D11 = length(remap(T11.rg)) + (T11.b - 0.5) / texw;\r\n\t\r\n\t// Interpolate along v\r\n\tvec2 D0_1 = mix(vec2(D00, D10), vec2(D01, D11), uvlerp.y);\r\n\t\r\n\t// Interpolate along u\r\n\tfloat D = mix(D0_1.x, D0_1.y, uvlerp.x);\r\n\t\r\n\tfloat g = aastep(threshold, D);\r\n\t\r\n\tfloat a = min(g, alpha);\r\n\t\r\n\t// Final fragment color\r\n\tif(g > 0.02)\r\n\t{\r\n\t\tgl_FragColor = vec4(color, a);\r\n\t}\r\n\telse\r\n\t{\r\n\t\tgl_FragColor = vec4(vec3(g), a);\r\n\t}\r\n}";
shaders_FXAA.uniforms = { tDiffuse : { type : "t", value : null}, resolution : { type : "v2", value : new THREE.Vector2(1024.0,1024.0)}};
shaders_FXAA.vertexShader = "varying vec2 vUv;\r\n\r\nvoid main()\r\n{\r\n\tvUv = uv;\r\n\tgl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);\r\n}";
shaders_FXAA.fragmentShader = "// Fast approximate anti-aliasing shader\r\n// Based on the three.js implementation: https://github.com/mrdoob/three.js/blob/master/examples/js/shaders/FXAAShader.js\r\n// Ported to three.js by alteredq: http://alteredqualia.com/ and davidedc: http://www.sketchpatch.net/\r\n// Ported to WebGL by @supereggbert: http://www.geeks3d.com/20110405/fxaa-fast-approximate-anti-aliasing-demo-glsl-opengl-test-radeon-geforce/\r\n// Originally implemented as NVIDIA FXAA by Timothy Lottes: http://timothylottes.blogspot.com/2011/06/fxaa3-source-released.html\r\n// Paper: http://developer.download.nvidia.com/assets/gamedev/files/sdk/11/FXAA_WhitePaper.pdf\r\n\r\n#define FXAA_REDUCE_MIN (1.0/128.0)\r\n#define FXAA_REDUCE_MUL (1.0/8.0)\r\n#define FXAA_SPAN_MAX 8.0\r\n\r\nvarying vec2 vUv;\r\n\r\nuniform sampler2D tDiffuse;\r\nuniform vec2 resolution;\r\n\r\nvoid main()\r\n{\r\n\tvec2 rres = vec2(1.0) / resolution;\r\n\t\r\n\t// Texture lookups to find RGB values in area of current fragment\r\n\tvec3 rgbNW = texture2D(tDiffuse, (gl_FragCoord.xy + vec2(-1.0, -1.0)) * rres).xyz;\r\n\tvec3 rgbNE = texture2D(tDiffuse, (gl_FragCoord.xy + vec2(1.0, -1.0)) * rres).xyz;\r\n\tvec3 rgbSW = texture2D(tDiffuse, (gl_FragCoord.xy + vec2(-1.0, 1.0)) * rres).xyz;\r\n\tvec3 rgbSE = texture2D(tDiffuse, (gl_FragCoord.xy + vec2(1.0, 1.0)) * rres).xyz;\r\n\tvec4 rgbaM = texture2D(tDiffuse, gl_FragCoord.xy  * rres);\r\n\tvec3 rgbM = rgbaM.xyz;\r\n\tfloat opacity = rgbaM.w;\r\n\t\r\n\t// Luminance estimates for colors around current fragment\r\n\tvec3 luma = vec3(0.299, 0.587, 0.114);\r\n\tfloat lumaNW = dot(rgbNW, luma);\r\n\tfloat lumaNE = dot(rgbNE, luma);\r\n\tfloat lumaSW = dot(rgbSW, luma);\r\n\tfloat lumaSE = dot(rgbSE, luma);\r\n\tfloat lumaM  = dot(rgbM, luma);\r\n\tfloat lumaMin = min(lumaM, min(min(lumaNW, lumaNE), min(lumaSW, lumaSE)));\r\n\tfloat lumaMax = max(lumaM, max(max(lumaNW, lumaNE), max(lumaSW, lumaSE)));\r\n\r\n\t// \r\n\tvec2 dir;\r\n\tdir.x = -((lumaNW + lumaNE) - (lumaSW + lumaSE));\r\n\tdir.y =  ((lumaNW + lumaSW) - (lumaNE + lumaSE));\r\n\r\n\tfloat dirReduce = max((lumaNW + lumaNE + lumaSW + lumaSE) * (0.25 * FXAA_REDUCE_MUL), FXAA_REDUCE_MIN);\r\n\r\n\tfloat rcpDirMin = 1.0 / (min(abs(dir.x), abs(dir.y)) + dirReduce);\r\n\tdir = min(vec2(FXAA_SPAN_MAX, FXAA_SPAN_MAX), max(vec2(-FXAA_SPAN_MAX, -FXAA_SPAN_MAX), dir * rcpDirMin)) * rres;\r\n\r\n\tvec3 rgbA = 0.5 * (texture2D(tDiffuse, gl_FragCoord.xy * rres + dir * (1.0 / 3.0 - 0.5 )).xyz + texture2D(tDiffuse, gl_FragCoord.xy * rres + dir * (2.0 / 3.0 - 0.5)).xyz);\r\n\tvec3 rgbB = rgbA * 0.5 + 0.25 * (texture2D(tDiffuse, gl_FragCoord.xy * rres + dir * -0.5).xyz + texture2D(tDiffuse, gl_FragCoord.xy * rres + dir * 0.5).xyz);\r\n\r\n\tfloat lumaB = dot(rgbB, luma);\r\n\t\r\n\tif ((lumaB < lumaMin) || (lumaB > lumaMax))\r\n\t{\r\n\t\tgl_FragColor = vec4(rgbA, opacity);\r\n\t}\r\n\telse\r\n\t{\r\n\t\tgl_FragColor = vec4(rgbB, opacity);\r\n\t}\r\n}";
Main.main();
})(typeof console != "undefined" ? console : {log:function(){}}, typeof window != "undefined" ? window : typeof global != "undefined" ? global : typeof self != "undefined" ? self : this);
