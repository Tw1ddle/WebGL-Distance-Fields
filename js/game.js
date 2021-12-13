(function ($global) { "use strict";
var $estr = function() { return js_Boot.__string_rec(this,''); },$hxEnums = $hxEnums || {};
function $extend(from, fields) {
	var proto = Object.create(from);
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
HxOverrides.remove = function(a,obj) {
	var i = a.indexOf(obj);
	if(i == -1) {
		return false;
	}
	a.splice(i,1);
	return true;
};
HxOverrides.now = function() {
	return Date.now();
};
var InputGenerator = function() { };
InputGenerator.__name__ = true;
InputGenerator.generateText = function(s,width,height,font,scaleFactor) {
	if(scaleFactor == null) {
		scaleFactor = 0.25;
	}
	if(font == null) {
		font = "Consolas";
	}
	if(height == null) {
		height = 512;
	}
	if(width == null) {
		width = 512;
	}
	if(s == null) {
		throw haxe_Exception.thrown("FAIL: s != null");
	}
	if(font == null) {
		throw haxe_Exception.thrown("FAIL: font != null");
	}
	var canvas = window.document.createElement("canvas");
	canvas.width = width;
	canvas.height = height;
	canvas.style.background = "black";
	var context = canvas.getContext("2d");
	var pxSize = Math.min(width,height) * 0.8 / s.length | 0;
	var scaledPxSize = Math.min(width,height) * 0.8 / s.length * scaleFactor | 0;
	context.fillStyle = "#ffffff";
	context.font = (pxSize == null ? "null" : "" + pxSize) + "px " + font;
	context.textBaseline = "middle";
	context.textAlign = "center";
	context.antialias = "subpixel";
	context.patternQuality = "best";
	context.filter = "best";
	context.imageSmoothingEnabled = true;
	context.font = (scaledPxSize == null ? "null" : "" + scaledPxSize) + "px " + font;
	var metrics = context.measureText(s);
	context.font = (pxSize == null ? "null" : "" + pxSize) + "px " + font;
	context.fillText(s,canvas.width / 2,canvas.height / 2);
	if(scaleFactor < 1.0) {
		canvas = InputGenerator.downScaleCanvas(canvas,scaleFactor);
	}
	return { canvas : canvas, metrics : metrics};
};
InputGenerator.downScaleCanvas = function(cv,scale) {
	if(scale <= 0.0 || scale >= 1.0) {
		throw haxe_Exception.thrown("Scale must be a positive number < 1");
	}
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
			++sx;
		}
		++sy;
	}
	var result = window.document.createElement("canvas");
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
		++pxIndex;
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
		var _gthis = this;
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
			case 1:
				unsupportedInfo.innerHTML = "Your browser supports WebGL, but the feature appears to be disabled. Click <a href=\"" + "https://github.com/Tw1ddle/WebGL-Distance-Fields" + "\" target=\"_blank\">here for project info</a> instead.";
				break;
			case 2:
				unsupportedInfo.innerHTML = "Your browser does not support WebGL. Click <a href=\"" + "https://github.com/Tw1ddle/WebGL-Distance-Fields" + "\" target=\"_blank\">here for project info</a> instead.";
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
		info.innerHTML = "<p><a href=\"https://github.com/Tw1ddle/WebGL-Distance-Fields\" target=\"_blank\">Distance fields</a> by <a href=\"https://www.samcodes.co.uk/\" target=\"_blank\">Sam Twidale</a>. Technique by <a href=\"https://contourtextures.wikidot.com/\" target=\"_blank\">Stefan Gustavson</a>.</p><p>Type something. Use the mousewheel to zoom.</p>";
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
			_gthis.onResize();
		},true);
		window.addEventListener("contextmenu",function(event) {
			event.preventDefault();
		},true);
		window.addEventListener("keypress",function(event) {
			if(!_gthis.loaded) {
				event.preventDefault();
				return;
			}
			var keycode = event.which == null ? event.keyCode : event.which;
			if(keycode <= 0) {
				event.preventDefault();
				return;
			}
			var ch = String.fromCodePoint(keycode);
			if(ch.length > 0 && keycode != 8) {
				_gthis.generateDistanceFieldForString(ch);
				var character = _gthis.characterMap.h[ch].create();
				if(character == null) {
					throw haxe_Exception.thrown("FAIL: character != null");
				}
				_gthis.scene.add(character);
				var spawn = character.spawnPosition;
				var target = character.targetPosition;
				if(_gthis.characters.length > 0) {
					var lastTarget = _gthis.characters[_gthis.characters.length - 1].targetPosition;
					target.set(lastTarget.x + character.metrics.width,lastTarget.y,lastTarget.z + 1.0);
				} else {
					target.set(0,0,0);
				}
				spawn.set(target.x + 50 + Math.random() * 300,target.y + Math.random() * 300 - 150,target.z);
				character.position.set(spawn.x,spawn.y,spawn.z);
				character.scale.set(0,0,1);
				_gthis.characters.push(character);
				motion_Actuate.tween(character.scale,1,{ x : 1.0, y : 1.0});
				motion_Actuate.tween(character.position,1,{ x : target.x, y : target.y, z : target.z});
				motion_Actuate.tween(_gthis.camera.position,1,{ x : target.x, y : target.y, z : Math.min(1000,_gthis.camera.position.z + 25)});
			}
			event.preventDefault();
		},true);
		window.addEventListener("keydown",function(event) {
			if(!_gthis.loaded) {
				event.preventDefault();
				return;
			}
			var keycode = event.which == null ? event.keyCode : event.which;
			if(keycode == 8 || keycode == 46) {
				var _gthis1 = _gthis;
				if(_gthis.characters.length != 0) {
					var character = _gthis.characters.pop();
					if(character == null) {
						throw haxe_Exception.thrown("FAIL: character != null");
					}
					motion_Actuate.tween(character.scale,1,{ x : 0.0, y : 0.0});
					if(_gthis.characters.length > 0) {
						var last = _gthis.characters[_gthis.characters.length - 1].position;
						motion_Actuate.tween(_gthis.camera.position,1,{ x : last.x, y : last.y, z : Math.max(150,_gthis.camera.position.z - 25)});
					}
					motion_Actuate.tween(character.position,1,{ x : character.spawnPosition.x, y : character.spawnPosition.y}).onComplete(function() {
						_gthis1.scene.remove(character);
					});
				}
				event.preventDefault();
			}
		},true);
		var onMouseWheel = function(event) {
			if(!_gthis.loaded) {
				event.preventDefault();
				return;
			}
			var delta = event.wheelDelta == null ? event.detail : event.wheelDelta;
			if(delta > 0) {
				_gthis.camera.position.z -= 20;
			} else if(delta < 0) {
				_gthis.camera.position.z += 20;
			}
			event.preventDefault();
		};
		window.document.addEventListener("mousewheel",onMouseWheel,false);
		window.document.addEventListener("DOMMouseScroll",onMouseWheel,false);
		var _gthis1 = this;
		var t = 300;
		var _g = 0;
		var _g1 = "TYPE SOMETHING! ".length;
		while(_g < _g1) {
			var i = [_g++];
			haxe_Timer.delay((function(i) {
				return function() {
					_gthis1.generateDistanceFieldForString("TYPE SOMETHING! ".charAt(i[0]));
					var character = _gthis1.characterMap.h["TYPE SOMETHING! ".charAt(i[0])].create();
					if(character == null) {
						throw haxe_Exception.thrown("FAIL: character != null");
					}
					_gthis1.scene.add(character);
					var spawn = character.spawnPosition;
					var target = character.targetPosition;
					if(_gthis1.characters.length > 0) {
						var lastTarget = _gthis1.characters[_gthis1.characters.length - 1].targetPosition;
						target.set(lastTarget.x + character.metrics.width,lastTarget.y,lastTarget.z + 1.0);
					} else {
						target.set(0,0,0);
					}
					spawn.set(target.x + 50 + Math.random() * 300,target.y + Math.random() * 300 - 150,target.z);
					character.position.set(spawn.x,spawn.y,spawn.z);
					character.scale.set(0,0,1);
					_gthis1.characters.push(character);
					motion_Actuate.tween(character.scale,1,{ x : 1.0, y : 1.0});
					motion_Actuate.tween(character.position,1,{ x : target.x, y : target.y, z : target.z});
					motion_Actuate.tween(_gthis1.camera.position,1,{ x : target.x, y : target.y, z : Math.min(1000,_gthis1.camera.position.z + 25)});
				};
			})(i),t);
			t += 300;
		}
		this.loaded = true;
		gameDiv.appendChild(this.renderer.domElement);
		window.requestAnimationFrame($bind(this,this.animate));
	}
	,generateDelayedString: function(message,msPerLetter) {
		var _gthis = this;
		var t = msPerLetter;
		var _g = 0;
		var _g1 = message.length;
		while(_g < _g1) {
			var i = [_g++];
			haxe_Timer.delay((function(i) {
				return function() {
					_gthis.generateDistanceFieldForString(message.charAt(i[0]));
					var character = _gthis.characterMap.h[message.charAt(i[0])].create();
					if(character == null) {
						throw haxe_Exception.thrown("FAIL: character != null");
					}
					_gthis.scene.add(character);
					var spawn = character.spawnPosition;
					var target = character.targetPosition;
					if(_gthis.characters.length > 0) {
						var lastTarget = _gthis.characters[_gthis.characters.length - 1].targetPosition;
						target.set(lastTarget.x + character.metrics.width,lastTarget.y,lastTarget.z + 1.0);
					} else {
						target.set(0,0,0);
					}
					spawn.set(target.x + 50 + Math.random() * 300,target.y + Math.random() * 300 - 150,target.z);
					character.position.set(spawn.x,spawn.y,spawn.z);
					character.scale.set(0,0,1);
					_gthis.characters.push(character);
					motion_Actuate.tween(character.scale,1,{ x : 1.0, y : 1.0});
					motion_Actuate.tween(character.position,1,{ x : target.x, y : target.y, z : target.z});
					motion_Actuate.tween(_gthis.camera.position,1,{ x : target.x, y : target.y, z : Math.min(1000,_gthis.camera.position.z + 25)});
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
		if(!Object.prototype.hasOwnProperty.call(this.characterMap.h,s)) {
			var data = InputGenerator.generateText(s);
			var metrics = data.metrics;
			var texture = new THREE.Texture(data.canvas,THREE.UVMapping);
			texture.needsUpdate = true;
			var width = texture.image.width;
			var height = texture.image.height;
			var target = this.sdfMap.h[s];
			if(target == null) {
				target = this.sdfMaker.transformTexture(texture,true);
				this.sdfMap.h[s] = target;
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
			var makeColor = function(idx,phase) {
				var center = 0.5;
				var width = 0.5;
				var frequency = Math.PI * 2;
				var red = Math.sin(frequency * idx + 2 + phase) * width + center;
				var green = Math.sin(frequency * idx + phase) * width + center;
				var blue = Math.sin(frequency * idx + 4 + phase) * width + center;
				return { r : red, g : green, b : blue};
			};
			var col = makeColor(Main.fieldsGenerated,Math.cos(HxOverrides.now() / 1000));
			demoMaterial.uniforms.color.value.set(col.r,col.g,col.b);
			Main.fieldsGenerated++;
			var _this = this.characterMap;
			var value = new Character(geometry,demoMaterial,target.width,target.height,metrics);
			_this.h[s] = value;
		}
	}
	,generateDistanceField: function(element,metrics,id,blurInput) {
		if(blurInput == null) {
			blurInput = true;
		}
		var texture = new THREE.Texture(element,THREE.UVMapping);
		texture.needsUpdate = true;
		var width = texture.image.width;
		var height = texture.image.height;
		var target = this.sdfMap.h[id];
		if(target == null) {
			target = this.sdfMaker.transformTexture(texture,blurInput);
			this.sdfMap.h[id] = target;
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
		var makeColor = function(idx,phase) {
			var center = 0.5;
			var width = 0.5;
			var frequency = Math.PI * 2;
			var red = Math.sin(frequency * idx + 2 + phase) * width + center;
			var green = Math.sin(frequency * idx + phase) * width + center;
			var blue = Math.sin(frequency * idx + 4 + phase) * width + center;
			return { r : red, g : green, b : blue};
		};
		var col = makeColor(Main.fieldsGenerated,Math.cos(HxOverrides.now() / 1000));
		demoMaterial.uniforms.color.value.set(col.r,col.g,col.b);
		Main.fieldsGenerated++;
		var _this = this.characterMap;
		var value = new Character(geometry,demoMaterial,target.width,target.height,metrics);
		_this.h[id] = value;
	}
	,addCharacter: function(character) {
		if(character == null) {
			throw haxe_Exception.thrown("FAIL: character != null");
		}
		this.scene.add(character);
		var spawn = character.spawnPosition;
		var target = character.targetPosition;
		if(this.characters.length > 0) {
			var lastTarget = this.characters[this.characters.length - 1].targetPosition;
			target.set(lastTarget.x + character.metrics.width,lastTarget.y,lastTarget.z + 1.0);
		} else {
			target.set(0,0,0);
		}
		spawn.set(target.x + 50 + Math.random() * 300,target.y + Math.random() * 300 - 150,target.z);
		character.position.set(spawn.x,spawn.y,spawn.z);
		character.scale.set(0,0,1);
		this.characters.push(character);
		motion_Actuate.tween(character.scale,1,{ x : 1.0, y : 1.0});
		motion_Actuate.tween(character.position,1,{ x : target.x, y : target.y, z : target.z});
		motion_Actuate.tween(this.camera.position,1,{ x : target.x, y : target.y, z : Math.min(1000,this.camera.position.z + 25)});
	}
	,removeCharacter: function() {
		var _gthis = this;
		if(this.characters.length == 0) {
			return;
		}
		var character = this.characters.pop();
		if(character == null) {
			throw haxe_Exception.thrown("FAIL: character != null");
		}
		motion_Actuate.tween(character.scale,1,{ x : 0.0, y : 0.0});
		if(this.characters.length > 0) {
			var last = this.characters[this.characters.length - 1].position;
			motion_Actuate.tween(this.camera.position,1,{ x : last.x, y : last.y, z : Math.max(150,this.camera.position.z - 25)});
		}
		motion_Actuate.tween(character.position,1,{ x : character.spawnPosition.x, y : character.spawnPosition.y}).onComplete(function() {
			_gthis.scene.remove(character);
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
	} catch( _g ) {
		return null;
	}
};
Reflect.getProperty = function(o,field) {
	var tmp;
	if(o == null) {
		return null;
	} else {
		var tmp1;
		if(o.__properties__) {
			tmp = o.__properties__["get_" + field];
			tmp1 = tmp;
		} else {
			tmp1 = false;
		}
		if(tmp1) {
			return o[tmp]();
		} else {
			return o[field];
		}
	}
};
Reflect.setProperty = function(o,field,value) {
	var tmp;
	var tmp1;
	if(o.__properties__) {
		tmp = o.__properties__["set_" + field];
		tmp1 = tmp;
	} else {
		tmp1 = false;
	}
	if(tmp1) {
		o[tmp](value);
	} else {
		o[field] = value;
	}
};
Reflect.fields = function(o) {
	var a = [];
	if(o != null) {
		var hasOwnProperty = Object.prototype.hasOwnProperty;
		for( var f in o ) {
		if(f != "__id__" && f != "hx__closures__" && hasOwnProperty.call(o,f)) {
			a.push(f);
		}
		}
	}
	return a;
};
var Std = function() { };
Std.__name__ = true;
Std.string = function(s) {
	return js_Boot.__string_rec(s,"");
};
var Type = function() { };
Type.__name__ = true;
Type.createInstance = function(cl,args) {
	var ctor = Function.prototype.bind.apply(cl,[null].concat(args));
	return new (ctor);
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
		if(exclude != null && exclude.indexOf(key) != -1) {
			continue;
		}
		var type = v.type;
		var value = v.value;
		switch(type) {
		case "f":
			if(Object.prototype.hasOwnProperty.call(v,"min") && Object.prototype.hasOwnProperty.call(v,"max")) {
				folder.add(v,"value").listen().min(v.min).max(v.max).name(key);
			} else {
				folder.add(v,"value").listen().name(key);
			}
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
	if(gui == null || object == null) {
		return null;
	}
	var folder = null;
	if(tag != null) {
		folder = gui.addFolder(tag + " (" + dat_ThreeObjectGUI.guiItemCount++ + ")");
	} else {
		var name = Std.string(Reflect.field(object,"name"));
		if(name == null || name.length == 0) {
			folder = gui.addFolder("Item (" + dat_ThreeObjectGUI.guiItemCount++ + ")");
		} else {
			folder = gui.addFolder(Std.string(Reflect.getProperty(object,"name")) + " (" + dat_ThreeObjectGUI.guiItemCount++ + ")");
		}
	}
	if(((object) instanceof THREE.Scene)) {
		var scene = object;
		var _g = 0;
		var _g1 = scene.children;
		while(_g < _g1.length) {
			var object1 = _g1[_g];
			++_g;
			dat_ThreeObjectGUI.addItem(gui,object1);
		}
	}
	if(((object) instanceof THREE.Object3D)) {
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
	if(((object) instanceof THREE.PointLight)) {
		var light = object;
		folder.add(light,"intensity",0,3,0.01).listen();
	}
	return folder;
};
var haxe_IMap = function() { };
haxe_IMap.__name__ = true;
haxe_IMap.__isInterface__ = true;
var haxe_Exception = function(message,previous,native) {
	Error.call(this,message);
	this.message = message;
	this.__previousException = previous;
	this.__nativeException = native != null ? native : this;
};
haxe_Exception.__name__ = true;
haxe_Exception.thrown = function(value) {
	if(((value) instanceof haxe_Exception)) {
		return value.get_native();
	} else if(((value) instanceof Error)) {
		return value;
	} else {
		var e = new haxe_ValueException(value);
		return e;
	}
};
haxe_Exception.__super__ = Error;
haxe_Exception.prototype = $extend(Error.prototype,{
	get_native: function() {
		return this.__nativeException;
	}
	,__class__: haxe_Exception
	,__properties__: {get_native:"get_native"}
});
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
haxe_Timer.prototype = {
	stop: function() {
		if(this.id == null) {
			return;
		}
		clearInterval(this.id);
		this.id = null;
	}
	,run: function() {
	}
	,__class__: haxe_Timer
};
var haxe_ValueException = function(value,previous,native) {
	haxe_Exception.call(this,String(value),previous,native);
	this.value = value;
};
haxe_ValueException.__name__ = true;
haxe_ValueException.__super__ = haxe_Exception;
haxe_ValueException.prototype = $extend(haxe_Exception.prototype,{
	__class__: haxe_ValueException
});
var haxe_ds_ObjectMap = function() {
	this.h = { __keys__ : { }};
};
haxe_ds_ObjectMap.__name__ = true;
haxe_ds_ObjectMap.__interfaces__ = [haxe_IMap];
haxe_ds_ObjectMap.prototype = {
	set: function(key,value) {
		var id = key.__id__;
		if(id == null) {
			id = (key.__id__ = $global.$haxeUID++);
		}
		this.h[id] = value;
		this.h.__keys__[id] = key;
	}
	,remove: function(key) {
		var id = key.__id__;
		if(this.h.__keys__[id] == null) {
			return false;
		}
		delete(this.h[id]);
		delete(this.h.__keys__[id]);
		return true;
	}
	,keys: function() {
		var a = [];
		for( var key in this.h.__keys__ ) {
		if(this.h.hasOwnProperty(key)) {
			a.push(this.h.__keys__[key]);
		}
		}
		return new haxe_iterators_ArrayIterator(a);
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
	this.h = Object.create(null);
};
haxe_ds_StringMap.__name__ = true;
haxe_ds_StringMap.__interfaces__ = [haxe_IMap];
haxe_ds_StringMap.prototype = {
	__class__: haxe_ds_StringMap
};
var haxe_iterators_ArrayIterator = function(array) {
	this.current = 0;
	this.array = array;
};
haxe_iterators_ArrayIterator.__name__ = true;
haxe_iterators_ArrayIterator.prototype = {
	hasNext: function() {
		return this.current < this.array.length;
	}
	,next: function() {
		return this.array[this.current++];
	}
	,__class__: haxe_iterators_ArrayIterator
};
var js_Boot = function() { };
js_Boot.__name__ = true;
js_Boot.getClass = function(o) {
	if(o == null) {
		return null;
	} else if(((o) instanceof Array)) {
		return Array;
	} else {
		var cl = o.__class__;
		if(cl != null) {
			return cl;
		}
		var name = js_Boot.__nativeClassName(o);
		if(name != null) {
			return js_Boot.__resolveNativeClass(name);
		}
		return null;
	}
};
js_Boot.__string_rec = function(o,s) {
	if(o == null) {
		return "null";
	}
	if(s.length >= 5) {
		return "<...>";
	}
	var t = typeof(o);
	if(t == "function" && (o.__name__ || o.__ename__)) {
		t = "object";
	}
	switch(t) {
	case "function":
		return "<function>";
	case "object":
		if(o.__enum__) {
			var e = $hxEnums[o.__enum__];
			var con = e.__constructs__[o._hx_index];
			var n = con._hx_name;
			if(con.__params__) {
				s = s + "\t";
				return n + "(" + ((function($this) {
					var $r;
					var _g = [];
					{
						var _g1 = 0;
						var _g2 = con.__params__;
						while(true) {
							if(!(_g1 < _g2.length)) {
								break;
							}
							var p = _g2[_g1];
							_g1 = _g1 + 1;
							_g.push(js_Boot.__string_rec(o[p],s));
						}
					}
					$r = _g;
					return $r;
				}(this))).join(",") + ")";
			} else {
				return n;
			}
		}
		if(((o) instanceof Array)) {
			var str = "[";
			s += "\t";
			var _g = 0;
			var _g1 = o.length;
			while(_g < _g1) {
				var i = _g++;
				str += (i > 0 ? "," : "") + js_Boot.__string_rec(o[i],s);
			}
			str += "]";
			return str;
		}
		var tostr;
		try {
			tostr = o.toString;
		} catch( _g ) {
			return "???";
		}
		if(tostr != null && tostr != Object.toString && typeof(tostr) == "function") {
			var s2 = o.toString();
			if(s2 != "[object Object]") {
				return s2;
			}
		}
		var str = "{\n";
		s += "\t";
		var hasp = o.hasOwnProperty != null;
		var k = null;
		for( k in o ) {
		if(hasp && !o.hasOwnProperty(k)) {
			continue;
		}
		if(k == "prototype" || k == "__class__" || k == "__super__" || k == "__interfaces__" || k == "__properties__") {
			continue;
		}
		if(str.length != 2) {
			str += ", \n";
		}
		str += s + k + " : " + js_Boot.__string_rec(o[k],s);
		}
		s = s.substring(1);
		str += "\n" + s + "}";
		return str;
	case "string":
		return o;
	default:
		return String(o);
	}
};
js_Boot.__interfLoop = function(cc,cl) {
	if(cc == null) {
		return false;
	}
	if(cc == cl) {
		return true;
	}
	var intf = cc.__interfaces__;
	if(intf != null) {
		var _g = 0;
		var _g1 = intf.length;
		while(_g < _g1) {
			var i = _g++;
			var i1 = intf[i];
			if(i1 == cl || js_Boot.__interfLoop(i1,cl)) {
				return true;
			}
		}
	}
	return js_Boot.__interfLoop(cc.__super__,cl);
};
js_Boot.__instanceof = function(o,cl) {
	if(cl == null) {
		return false;
	}
	switch(cl) {
	case Array:
		return ((o) instanceof Array);
	case Bool:
		return typeof(o) == "boolean";
	case Dynamic:
		return o != null;
	case Float:
		return typeof(o) == "number";
	case Int:
		if(typeof(o) == "number") {
			return ((o | 0) === o);
		} else {
			return false;
		}
		break;
	case String:
		return typeof(o) == "string";
	default:
		if(o != null) {
			if(typeof(cl) == "function") {
				if(js_Boot.__downcastCheck(o,cl)) {
					return true;
				}
			} else if(typeof(cl) == "object" && js_Boot.__isNativeObj(cl)) {
				if(((o) instanceof cl)) {
					return true;
				}
			}
		} else {
			return false;
		}
		if(cl == Class ? o.__name__ != null : false) {
			return true;
		}
		if(cl == Enum ? o.__ename__ != null : false) {
			return true;
		}
		return o.__enum__ != null ? $hxEnums[o.__enum__] == cl : false;
	}
};
js_Boot.__downcastCheck = function(o,cl) {
	if(!((o) instanceof cl)) {
		if(cl.__isInterface__) {
			return js_Boot.__interfLoop(js_Boot.getClass(o),cl);
		} else {
			return false;
		}
	} else {
		return true;
	}
};
js_Boot.__implements = function(o,iface) {
	return js_Boot.__interfLoop(js_Boot.getClass(o),iface);
};
js_Boot.__cast = function(o,t) {
	if(o == null || js_Boot.__instanceof(o,t)) {
		return o;
	} else {
		throw haxe_Exception.thrown("Cannot cast " + Std.string(o) + " to " + Std.string(t));
	}
};
js_Boot.__nativeClassName = function(o) {
	var name = js_Boot.__toStr.call(o).slice(8,-1);
	if(name == "Object" || name == "Function" || name == "Math" || name == "JSON") {
		return null;
	}
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
motion_actuators_IGenericActuator.__isInterface__ = true;
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
			if(Object.prototype.hasOwnProperty.call(this.target,i)) {
				this.target[i] = Reflect.field(this.properties,i);
			} else {
				Reflect.setProperty(this.target,i,Reflect.field(this.properties,i));
			}
		}
	}
	,autoVisible: function(value) {
		if(value == null) {
			value = true;
		}
		this._autoVisible = value;
		return this;
	}
	,callMethod: function(method,params) {
		if(params == null) {
			params = [];
		}
		return method.apply(method,params);
	}
	,change: function() {
		if(this._onUpdate != null) {
			var method = this._onUpdate;
			var params = this._onUpdateParams;
			if(params == null) {
				params = [];
			}
			method.apply(method,params);
		}
	}
	,complete: function(sendEvent) {
		if(sendEvent == null) {
			sendEvent = true;
		}
		if(sendEvent) {
			this.change();
			if(this._onComplete != null) {
				var method = this._onComplete;
				var params = this._onCompleteParams;
				if(params == null) {
					params = [];
				}
				method.apply(method,params);
			}
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
		if(parameters == null) {
			this._onCompleteParams = [];
		} else {
			this._onCompleteParams = parameters;
		}
		if(this.duration == 0) {
			this.complete();
		}
		return this;
	}
	,onRepeat: function(handler,parameters) {
		this._onRepeat = handler;
		if(parameters == null) {
			this._onRepeatParams = [];
		} else {
			this._onRepeatParams = parameters;
		}
		return this;
	}
	,onUpdate: function(handler,parameters) {
		this._onUpdate = handler;
		if(parameters == null) {
			this._onUpdateParams = [];
		} else {
			this._onUpdateParams = parameters;
		}
		return this;
	}
	,onPause: function(handler,parameters) {
		this._onPause = handler;
		if(parameters == null) {
			this._onPauseParams = [];
		} else {
			this._onPauseParams = parameters;
		}
		return this;
	}
	,onResume: function(handler,parameters) {
		this._onResume = handler;
		if(parameters == null) {
			this._onResumeParams = [];
		} else {
			this._onResumeParams = parameters;
		}
		return this;
	}
	,pause: function() {
		if(this._onPause != null) {
			var method = this._onPause;
			var params = this._onPauseParams;
			if(params == null) {
				params = [];
			}
			method.apply(method,params);
		}
	}
	,reflect: function(value) {
		if(value == null) {
			value = true;
		}
		this._reflect = value;
		this.special = true;
		return this;
	}
	,repeat: function(times) {
		if(times == null) {
			times = -1;
		}
		this._repeat = times;
		return this;
	}
	,resume: function() {
		if(this._onResume != null) {
			var method = this._onResume;
			var params = this._onResumeParams;
			if(params == null) {
				params = [];
			}
			method.apply(method,params);
		}
	}
	,reverse: function(value) {
		if(value == null) {
			value = true;
		}
		this._reverse = value;
		this.special = true;
		return this;
	}
	,smartRotation: function(value) {
		if(value == null) {
			value = true;
		}
		this._smartRotation = value;
		this.special = true;
		return this;
	}
	,snapping: function(value) {
		if(value == null) {
			value = true;
		}
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
	this.startTime = window.performance.now() / 1000;
	motion_actuators_GenericActuator.call(this,target,duration,properties);
	if(!motion_actuators_SimpleActuator.addedEvent) {
		motion_actuators_SimpleActuator.addedEvent = true;
		window.requestAnimationFrame(motion_actuators_SimpleActuator.stage_onEnterFrame);
	}
};
motion_actuators_SimpleActuator.__name__ = true;
motion_actuators_SimpleActuator.stage_onEnterFrame = function(deltaTime) {
	var currentTime = deltaTime / 1000;
	var actuator;
	var j = 0;
	var cleanup = false;
	var _g = 0;
	var _g1 = motion_actuators_SimpleActuator.actuatorsLength;
	while(_g < _g1) {
		var i = _g++;
		actuator = motion_actuators_SimpleActuator.actuators[j];
		if(actuator != null && actuator.active) {
			if(currentTime >= actuator.timeOffset) {
				actuator.update(currentTime);
			}
			++j;
		} else {
			motion_actuators_SimpleActuator.actuators.splice(j,1);
			--motion_actuators_SimpleActuator.actuatorsLength;
		}
	}
	window.requestAnimationFrame(motion_actuators_SimpleActuator.stage_onEnterFrame);
};
motion_actuators_SimpleActuator.__super__ = motion_actuators_GenericActuator;
motion_actuators_SimpleActuator.prototype = $extend(motion_actuators_GenericActuator.prototype,{
	apply: function() {
		motion_actuators_GenericActuator.prototype.apply.call(this);
		if(this.toggleVisible && Object.prototype.hasOwnProperty.call(this.properties,"alpha")) {
			var target = this.target;
			var value = null;
			if(Object.prototype.hasOwnProperty.call(target,"visible")) {
				value = Reflect.field(target,"visible");
			} else {
				value = Reflect.getProperty(target,"visible");
			}
			if(value != null) {
				var target = this.target;
				var value = Reflect.field(this.properties,"alpha") > 0;
				if(Object.prototype.hasOwnProperty.call(target,"visible")) {
					target["visible"] = value;
				} else {
					Reflect.setProperty(target,"visible",value);
				}
			}
		}
	}
	,autoVisible: function(value) {
		if(value == null) {
			value = true;
		}
		this._autoVisible = value;
		if(!value) {
			this.toggleVisible = false;
			if(this.setVisible) {
				var target = this.target;
				var value = this.cacheVisible;
				if(Object.prototype.hasOwnProperty.call(target,"visible")) {
					target["visible"] = value;
				} else {
					Reflect.setProperty(target,"visible",value);
				}
			}
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
		if(Object.prototype.hasOwnProperty.call(target,propertyName)) {
			value = Reflect.field(target,propertyName);
		} else {
			value = Reflect.getProperty(target,propertyName);
		}
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
			if(Object.prototype.hasOwnProperty.call(this.target,i)) {
				start = Reflect.field(this.target,i);
			} else {
				isField = false;
				start = Reflect.getProperty(this.target,i);
			}
			if(typeof(start) == "number") {
				var target = this.properties;
				var value = null;
				if(Object.prototype.hasOwnProperty.call(target,i)) {
					value = Reflect.field(target,i);
				} else {
					value = Reflect.getProperty(target,i);
				}
				var value1 = value;
				if(start == null) {
					start = 0;
				}
				if(value1 == null) {
					value1 = 0;
				}
				details = new motion_actuators_PropertyDetails(this.target,i,start,value1 - start,isField);
				this.propertyDetails.push(details);
			}
		}
		this.detailsLength = this.propertyDetails.length;
		this.initialized = true;
	}
	,move: function() {
		this.toggleVisible = Object.prototype.hasOwnProperty.call(this.properties,"alpha") && Object.prototype.hasOwnProperty.call(this.properties,"visible");
		var tmp;
		if(this.toggleVisible && this.properties.alpha != 0) {
			var target = this.target;
			var value = null;
			if(Object.prototype.hasOwnProperty.call(target,"visible")) {
				value = Reflect.field(target,"visible");
			} else {
				value = Reflect.getProperty(target,"visible");
			}
			tmp = !value;
		} else {
			tmp = false;
		}
		if(tmp) {
			this.setVisible = true;
			var target = this.target;
			var value = null;
			if(Object.prototype.hasOwnProperty.call(target,"visible")) {
				value = Reflect.field(target,"visible");
			} else {
				value = Reflect.getProperty(target,"visible");
			}
			this.cacheVisible = value;
			var target = this.target;
			var value = true;
			if(Object.prototype.hasOwnProperty.call(target,"visible")) {
				target["visible"] = value;
			} else {
				Reflect.setProperty(target,"visible",value);
			}
		}
		this.timeOffset = this.startTime;
		motion_actuators_SimpleActuator.actuators.push(this);
		++motion_actuators_SimpleActuator.actuatorsLength;
	}
	,onUpdate: function(handler,parameters) {
		this._onUpdate = handler;
		if(parameters == null) {
			this._onUpdateParams = [];
		} else {
			this._onUpdateParams = parameters;
		}
		this.sendChange = true;
		return this;
	}
	,pause: function() {
		if(!this.paused) {
			this.paused = true;
			motion_actuators_GenericActuator.prototype.pause.call(this);
			this.pauseTime = window.performance.now() / 1000;
		}
	}
	,resume: function() {
		if(this.paused) {
			this.paused = false;
			this.timeOffset += (window.performance.now() - this.pauseTime) / 1000;
			motion_actuators_GenericActuator.prototype.resume.call(this);
		}
	}
	,setField: function(target,propertyName,value) {
		if(Object.prototype.hasOwnProperty.call(target,propertyName)) {
			target[propertyName] = value;
		} else {
			Reflect.setProperty(target,propertyName,value);
		}
	}
	,setProperty: function(details,value) {
		if(details.isField) {
			details.target[details.propertyName] = value;
		} else {
			Reflect.setProperty(details.target,details.propertyName,value);
		}
	}
	,stop: function(properties,complete,sendEvent) {
		if(this.active) {
			if(properties == null) {
				this.active = false;
				if(complete) {
					this.apply();
				}
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
					if(complete) {
						this.apply();
					}
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
			if(tweenPosition > 1) {
				tweenPosition = 1;
			}
			if(!this.initialized) {
				this.initialize();
			}
			if(!this.special) {
				easing = this._ease.calculate(tweenPosition);
				var _g = 0;
				var _g1 = this.detailsLength;
				while(_g < _g1) {
					var i = _g++;
					details = this.propertyDetails[i];
					var value = details.start + details.change * easing;
					if(details.isField) {
						details.target[details.propertyName] = value;
					} else {
						Reflect.setProperty(details.target,details.propertyName,value);
					}
				}
			} else {
				if(!this._reverse) {
					easing = this._ease.calculate(tweenPosition);
				} else {
					easing = this._ease.calculate(1 - tweenPosition);
				}
				var endValue;
				var _g = 0;
				var _g1 = this.detailsLength;
				while(_g < _g1) {
					var i = _g++;
					details = this.propertyDetails[i];
					if(this._smartRotation && (details.propertyName == "rotation" || details.propertyName == "rotationX" || details.propertyName == "rotationY" || details.propertyName == "rotationZ")) {
						var rotation = details.change % 360;
						if(rotation > 180) {
							rotation -= 360;
						} else if(rotation < -180) {
							rotation += 360;
						}
						endValue = details.start + rotation * easing;
					} else {
						endValue = details.start + details.change * easing;
					}
					if(!this._snapping) {
						var value = endValue;
						if(details.isField) {
							details.target[details.propertyName] = value;
						} else {
							Reflect.setProperty(details.target,details.propertyName,value);
						}
					} else {
						var value1 = Math.round(endValue);
						if(details.isField) {
							details.target[details.propertyName] = value1;
						} else {
							Reflect.setProperty(details.target,details.propertyName,value1);
						}
					}
				}
			}
			if(tweenPosition == 1) {
				if(this._repeat == 0) {
					this.active = false;
					var tmp;
					if(this.toggleVisible) {
						var target = this.target;
						var value = null;
						if(Object.prototype.hasOwnProperty.call(target,"alpha")) {
							value = Reflect.field(target,"alpha");
						} else {
							value = Reflect.getProperty(target,"alpha");
						}
						tmp = value == 0;
					} else {
						tmp = false;
					}
					if(tmp) {
						var target = this.target;
						var value = false;
						if(Object.prototype.hasOwnProperty.call(target,"visible")) {
							target["visible"] = value;
						} else {
							Reflect.setProperty(target,"visible",value);
						}
					}
					this.complete(true);
					return;
				} else {
					if(this._onRepeat != null) {
						var method = this._onRepeat;
						var params = this._onRepeatParams;
						if(params == null) {
							params = [];
						}
						method.apply(method,params);
					}
					if(this._reflect) {
						this._reverse = !this._reverse;
					}
					this.startTime = currentTime;
					this.timeOffset = this.startTime + this._delay;
					if(this._repeat > 0) {
						this._repeat--;
					}
				}
			}
			if(this.sendChange) {
				this.change();
			}
		}
	}
	,__class__: motion_actuators_SimpleActuator
});
var motion_easing_IEasing = function() { };
motion_easing_IEasing.__name__ = true;
motion_easing_IEasing.__isInterface__ = true;
motion_easing_IEasing.prototype = {
	__class__: motion_easing_IEasing
};
var motion_easing__$Expo_ExpoEaseIn = function() {
};
motion_easing__$Expo_ExpoEaseIn.__name__ = true;
motion_easing__$Expo_ExpoEaseIn.__interfaces__ = [motion_easing_IEasing];
motion_easing__$Expo_ExpoEaseIn.prototype = {
	calculate: function(k) {
		if(k == 0) {
			return 0;
		} else {
			return Math.exp(6.931471805599453 * (k - 1));
		}
	}
	,ease: function(t,b,c,d) {
		if(t == 0) {
			return b;
		} else {
			return c * Math.exp(6.931471805599453 * (t / d - 1)) + b;
		}
	}
	,__class__: motion_easing__$Expo_ExpoEaseIn
};
var motion_easing__$Expo_ExpoEaseInOut = function() {
};
motion_easing__$Expo_ExpoEaseInOut.__name__ = true;
motion_easing__$Expo_ExpoEaseInOut.__interfaces__ = [motion_easing_IEasing];
motion_easing__$Expo_ExpoEaseInOut.prototype = {
	calculate: function(k) {
		if(k == 0) {
			return 0;
		}
		if(k == 1) {
			return 1;
		}
		if((k /= 0.5) < 1.0) {
			return 0.5 * Math.exp(6.931471805599453 * (k - 1));
		}
		return 0.5 * (2 - Math.exp(-6.931471805599453 * --k));
	}
	,ease: function(t,b,c,d) {
		if(t == 0) {
			return b;
		}
		if(t == d) {
			return b + c;
		}
		if((t /= d / 2.0) < 1.0) {
			return c / 2 * Math.exp(6.931471805599453 * (t - 1)) + b;
		}
		return c / 2 * (2 - Math.exp(-6.931471805599453 * --t)) + b;
	}
	,__class__: motion_easing__$Expo_ExpoEaseInOut
};
var motion_easing__$Expo_ExpoEaseOut = function() {
};
motion_easing__$Expo_ExpoEaseOut.__name__ = true;
motion_easing__$Expo_ExpoEaseOut.__interfaces__ = [motion_easing_IEasing];
motion_easing__$Expo_ExpoEaseOut.prototype = {
	calculate: function(k) {
		if(k == 1) {
			return 1;
		} else {
			return 1 - Math.exp(-6.931471805599453 * k);
		}
	}
	,ease: function(t,b,c,d) {
		if(t == d) {
			return b + c;
		} else {
			return c * (1 - Math.exp(-6.931471805599453 * t / d)) + b;
		}
	}
	,__class__: motion_easing__$Expo_ExpoEaseOut
};
var motion_easing_Expo = function() { };
motion_easing_Expo.__name__ = true;
var motion_Actuate = function() { };
motion_Actuate.__name__ = true;
motion_Actuate.apply = function(target,properties,customActuator) {
	motion_Actuate.stop(target,properties);
	if(customActuator == null) {
		customActuator = motion_Actuate.defaultActuator;
	}
	var actuator = Type.createInstance(customActuator,[target,0,properties]);
	actuator.apply();
	return actuator;
};
motion_Actuate.getLibrary = function(target,allowCreation) {
	if(allowCreation == null) {
		allowCreation = true;
	}
	if(motion_Actuate.targetLibraries.h.__keys__[target.__id__] == null && allowCreation) {
		motion_Actuate.targetLibraries.set(target,[]);
	}
	return motion_Actuate.targetLibraries.h[target.__id__];
};
motion_Actuate.isActive = function() {
	var result = false;
	var library = motion_Actuate.targetLibraries.iterator();
	while(library.hasNext()) {
		var library1 = library.next();
		result = true;
		break;
	}
	return result;
};
motion_Actuate.motionPath = function(target,duration,properties,overwrite) {
	if(overwrite == null) {
		overwrite = true;
	}
	return motion_Actuate.tween(target,duration,properties,overwrite,motion_actuators_MotionPathActuator);
};
motion_Actuate.pause = function(target) {
	if(js_Boot.__implements(target,motion_actuators_IGenericActuator)) {
		var actuator = target;
		actuator.pause();
	} else {
		var library = motion_Actuate.getLibrary(target,false);
		if(library != null) {
			var _g = 0;
			while(_g < library.length) {
				var actuator = library[_g];
				++_g;
				actuator.pause();
			}
		}
	}
};
motion_Actuate.pauseAll = function() {
	var library = motion_Actuate.targetLibraries.iterator();
	while(library.hasNext()) {
		var library1 = library.next();
		var _g = 0;
		while(_g < library1.length) {
			var actuator = library1[_g];
			++_g;
			actuator.pause();
		}
	}
};
motion_Actuate.reset = function() {
	var library = motion_Actuate.targetLibraries.iterator();
	while(library.hasNext()) {
		var library1 = library.next();
		var i = library1.length - 1;
		while(i >= 0) {
			library1[i].stop(null,false,false);
			--i;
		}
	}
	motion_Actuate.targetLibraries = new haxe_ds_ObjectMap();
};
motion_Actuate.resume = function(target) {
	if(js_Boot.__implements(target,motion_actuators_IGenericActuator)) {
		var actuator = target;
		actuator.resume();
	} else {
		var library = motion_Actuate.getLibrary(target,false);
		if(library != null) {
			var _g = 0;
			while(_g < library.length) {
				var actuator = library[_g];
				++_g;
				actuator.resume();
			}
		}
	}
};
motion_Actuate.resumeAll = function() {
	var library = motion_Actuate.targetLibraries.iterator();
	while(library.hasNext()) {
		var library1 = library.next();
		var _g = 0;
		while(_g < library1.length) {
			var actuator = library1[_g];
			++_g;
			actuator.resume();
		}
	}
};
motion_Actuate.stop = function(target,properties,complete,sendEvent) {
	if(sendEvent == null) {
		sendEvent = true;
	}
	if(complete == null) {
		complete = false;
	}
	if(target != null) {
		if(js_Boot.__implements(target,motion_actuators_IGenericActuator)) {
			var actuator = target;
			actuator.stop(null,complete,sendEvent);
		} else {
			var library = motion_Actuate.getLibrary(target,false);
			if(library != null) {
				if(typeof(properties) == "string") {
					var temp = { };
					temp[properties] = null;
					properties = temp;
				} else if(((properties) instanceof Array)) {
					var temp = { };
					var _g = 0;
					var _g1 = js_Boot.__cast(properties , Array);
					while(_g < _g1.length) {
						var property = _g1[_g];
						++_g;
						temp[property] = null;
					}
					properties = temp;
				}
				var i = library.length - 1;
				while(i >= 0) {
					library[i].stop(properties,complete,sendEvent);
					--i;
				}
			}
		}
	}
};
motion_Actuate.timer = function(duration,customActuator) {
	return motion_Actuate.tween(new motion__$Actuate_TweenTimer(0),duration,new motion__$Actuate_TweenTimer(1),false,customActuator);
};
motion_Actuate.tween = function(target,duration,properties,overwrite,customActuator) {
	if(overwrite == null) {
		overwrite = true;
	}
	if(target != null) {
		if(duration > 0) {
			if(customActuator == null) {
				customActuator = motion_Actuate.defaultActuator;
			}
			var actuator = Type.createInstance(customActuator,[target,duration,properties]);
			var library = motion_Actuate.getLibrary(actuator.target);
			if(overwrite) {
				var i = library.length - 1;
				while(i >= 0) {
					library[i].stop(actuator.properties,false,false);
					--i;
				}
				library = motion_Actuate.getLibrary(actuator.target);
			}
			library.push(actuator);
			actuator.move();
			return actuator;
		} else {
			return motion_Actuate.apply(target,properties,customActuator);
		}
	}
	return null;
};
motion_Actuate.unload = function(actuator) {
	var target = actuator.target;
	if(motion_Actuate.targetLibraries.h.__keys__[target.__id__] != null) {
		HxOverrides.remove(motion_Actuate.targetLibraries.h[target.__id__],actuator);
		if(motion_Actuate.targetLibraries.h[target.__id__].length == 0) {
			motion_Actuate.targetLibraries.remove(target);
		}
	}
};
motion_Actuate.update = function(target,duration,start,end,overwrite) {
	if(overwrite == null) {
		overwrite = true;
	}
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
	this._x = new motion__$MotionPath_ComponentPath();
	this._y = new motion__$MotionPath_ComponentPath();
	this._rotation = null;
};
motion_MotionPath.__name__ = true;
motion_MotionPath.prototype = {
	bezier: function(x,y,controlX,controlY,strength) {
		if(strength == null) {
			strength = 1;
		}
		return this.bezierN(x,y,[controlX],[controlY],strength);
	}
	,bezierN: function(x,y,controlX,controlY,strength) {
		if(strength == null) {
			strength = 1;
		}
		this._x.addPath(new motion__$MotionPath_BezierPath(x,controlX,strength));
		this._y.addPath(new motion__$MotionPath_BezierPath(y,controlY,strength));
		return this;
	}
	,bezierSpline: function(x,y,strength) {
		if(strength == null) {
			strength = 1;
		}
		this._x.addPath(new motion__$MotionPath_BezierSplinePath(x,strength));
		this._y.addPath(new motion__$MotionPath_BezierSplinePath(y,strength));
		return this;
	}
	,line: function(x,y,strength) {
		if(strength == null) {
			strength = 1;
		}
		return this.bezierN(x,y,[],[],strength);
	}
	,get_rotation: function() {
		if(this._rotation == null) {
			this._rotation = new motion__$MotionPath_RotationPath(this._x,this._y);
		}
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
motion_IComponentPath.__isInterface__ = true;
motion_IComponentPath.prototype = {
	__class__: motion_IComponentPath
	,__properties__: {get_end:"get_end",set_start:"set_start",get_start:"get_start"}
};
var motion__$MotionPath_ComponentPath = function() {
	this.paths = [];
	this.strength = 0;
};
motion__$MotionPath_ComponentPath.__name__ = true;
motion__$MotionPath_ComponentPath.__interfaces__ = [motion_IComponentPath];
motion__$MotionPath_ComponentPath.prototype = {
	addPath: function(path) {
		if(this.paths.length > 0) {
			path.set_start(this.paths[this.paths.length - 1].get_end());
		}
		this.paths.push(path);
		this.strength += path.strength;
	}
	,calculate: function(k) {
		if(this.paths.length == 1) {
			return this.paths[0].calculate(k);
		} else {
			var ratio = k * this.strength;
			var _g = 0;
			var _g1 = this.paths;
			while(_g < _g1.length) {
				var path = _g1[_g];
				++_g;
				if(ratio > path.strength) {
					ratio -= path.strength;
				} else {
					return path.calculate(ratio / path.strength);
				}
			}
		}
		return 0;
	}
	,get_start: function() {
		if(this.paths.length > 0) {
			return this.paths[0].get_start();
		} else {
			return 0;
		}
	}
	,set_start: function(value) {
		if(this.paths.length > 0) {
			return this.paths[0].set_start(value);
		} else {
			return 0;
		}
	}
	,get_end: function() {
		if(this.paths.length > 0) {
			var path = this.paths[this.paths.length - 1];
			return path.get_end();
		} else {
			return this.get_start();
		}
	}
	,__class__: motion__$MotionPath_ComponentPath
	,__properties__: {get_end:"get_end",set_start:"set_start",get_start:"get_start"}
};
var motion__$MotionPath_BezierPath = function(end,control,strength) {
	this._end = end;
	this.control = control;
	this.strength = strength;
};
motion__$MotionPath_BezierPath.__name__ = true;
motion__$MotionPath_BezierPath.__interfaces__ = [motion_IComponentPath];
motion__$MotionPath_BezierPath.prototype = {
	calculate: function(k) {
		var l = 1 - k;
		switch(this.control.length) {
		case 0:
			return l * this._start + k * this._end;
		case 1:
			return l * l * this._start + 2 * l * k * this.control[0] + k * k * this._end;
		case 2:
			return l * l * l * this._start + 3 * l * l * k * this.control[0] + 3 * l * k * k * this.control[1] + k * k * k * this._end;
		default:
			if(l < 1e-7) {
				return this._end;
			}
			var r = k / l;
			var n = this.control.length + 1;
			var coeff = Math.pow(l,n);
			var res = coeff * this._start;
			var _g = 1;
			var _g1 = n;
			while(_g < _g1) {
				var i = _g++;
				coeff *= r * (n + 1 - i) / i;
				res += coeff * this.control[i - 1];
			}
			coeff *= r / n;
			return res + coeff * this._end;
		}
	}
	,get_start: function() {
		return this._start;
	}
	,set_start: function(value) {
		return this._start = value;
	}
	,get_end: function() {
		return this._end;
	}
	,__class__: motion__$MotionPath_BezierPath
	,__properties__: {get_end:"get_end",set_start:"set_start",get_start:"get_start"}
};
var motion__$MotionPath_BezierSplinePath = function(through,strength) {
	motion__$MotionPath_ComponentPath.call(this);
	this.through = through;
	this.strength = strength;
};
motion__$MotionPath_BezierSplinePath.__name__ = true;
motion__$MotionPath_BezierSplinePath.__super__ = motion__$MotionPath_ComponentPath;
motion__$MotionPath_BezierSplinePath.prototype = $extend(motion__$MotionPath_ComponentPath.prototype,{
	computeControlPoints: function(start) {
		var K = [start].concat(this.through);
		var n = K.length;
		var _g = [];
		var _g1 = 0;
		var _g2 = n;
		while(_g1 < _g2) {
			var _ = _g1++;
			_g.push([0.0,0.0]);
		}
		var control = _g;
		var a = [];
		var b = [];
		var c = [];
		var r = [];
		a[0] = 0;
		b[0] = 2;
		c[0] = 1;
		r[0] = K[0] + 2 * K[1];
		var _g = 1;
		var _g1 = n - 1;
		while(_g < _g1) {
			var i = _g++;
			a[i] = 1;
			b[i] = 4;
			c[i] = 1;
			r[i] = 4 * K[i] + 2 * K[i + 1];
		}
		a[n - 1] = 1;
		b[n - 1] = 2;
		c[n - 1] = 0;
		r[n - 1] = 3 * K[n - 1];
		var _g = 1;
		var _g1 = n;
		while(_g < _g1) {
			var i = _g++;
			var m = a[i] / b[i - 1];
			b[i] -= m * c[i - 1];
			r[i] -= m * r[i - 1];
		}
		control[n - 1][0] = r[n - 1] / b[n - 1];
		var i = n - 2;
		while(i >= 0) {
			control[i][0] = (r[i] - c[i] * control[i + 1][0]) / b[i];
			--i;
		}
		var _g = 0;
		var _g1 = n - 1;
		while(_g < _g1) {
			var i = _g++;
			control[i][1] = 2 * K[i + 1] - control[i + 1][0];
		}
		control[n - 1][1] = 0.5 * (K[n] + control[n - 1][0]);
		control.pop();
		return control;
	}
	,set_start: function(value) {
		if(this.paths.length == 0 || Math.abs(value - this.get_start()) > 1e-7) {
			var control = this.computeControlPoints(value);
			var pathStrength = this.strength / control.length;
			this.strength = 0;
			this.paths.splice(0,this.paths.length);
			var _g = 0;
			var _g1 = control.length;
			while(_g < _g1) {
				var i = _g++;
				this.addPath(new motion__$MotionPath_BezierPath(this.through[i],control[i],pathStrength));
			}
		}
		return motion__$MotionPath_ComponentPath.prototype.set_start.call(this,value);
	}
	,get_end: function() {
		return this.through[this.through.length - 1];
	}
	,__class__: motion__$MotionPath_BezierSplinePath
});
var motion__$MotionPath_RotationPath = function(x,y) {
	this.step = 0.01;
	this._x = x;
	this._y = y;
	this.offset = 0;
	this.set_start(this.calculate(0.0));
};
motion__$MotionPath_RotationPath.__name__ = true;
motion__$MotionPath_RotationPath.__interfaces__ = [motion_IComponentPath];
motion__$MotionPath_RotationPath.prototype = {
	calculate: function(k) {
		var dX = this._x.calculate(k) - this._x.calculate(k + this.step);
		var dY = this._y.calculate(k) - this._y.calculate(k + this.step);
		var angle = Math.atan2(dY,dX) * (180 / Math.PI);
		angle = (angle + this.offset) % 360;
		return angle;
	}
	,get_start: function() {
		return this._start;
	}
	,set_start: function(value) {
		return this._start;
	}
	,get_end: function() {
		return this.calculate(1.0);
	}
	,__class__: motion__$MotionPath_RotationPath
	,__properties__: {set_start:"set_start",get_start:"get_start",get_end:"get_end"}
};
var motion_actuators_MethodActuator = function(target,duration,properties) {
	this.currentParameters = [];
	this.tweenProperties = { };
	motion_actuators_SimpleActuator.call(this,target,duration,properties);
	if(!Object.prototype.hasOwnProperty.call(properties,"start")) {
		this.properties.start = [];
	}
	if(!Object.prototype.hasOwnProperty.call(properties,"end")) {
		this.properties.end = this.properties.start;
	}
	var _g = 0;
	var _g1 = this.properties.start.length;
	while(_g < _g1) {
		var i = _g++;
		this.currentParameters.push(this.properties.start[i]);
	}
};
motion_actuators_MethodActuator.__name__ = true;
motion_actuators_MethodActuator.__super__ = motion_actuators_SimpleActuator;
motion_actuators_MethodActuator.prototype = $extend(motion_actuators_SimpleActuator.prototype,{
	apply: function() {
		var method = this.target;
		var params = this.properties.end;
		if(params == null) {
			params = [];
		}
		method.apply(method,params);
	}
	,complete: function(sendEvent) {
		if(sendEvent == null) {
			sendEvent = true;
		}
		var _g = 0;
		var _g1 = this.properties.start.length;
		while(_g < _g1) {
			var i = _g++;
			this.currentParameters[i] = Reflect.field(this.tweenProperties,"param" + i);
		}
		var method = this.target;
		var params = this.currentParameters;
		if(params == null) {
			params = [];
		}
		method.apply(method,params);
		motion_actuators_SimpleActuator.prototype.complete.call(this,sendEvent);
	}
	,initialize: function() {
		var details;
		var propertyName;
		var start;
		var _g = 0;
		var _g1 = this.properties.start.length;
		while(_g < _g1) {
			var i = _g++;
			propertyName = "param" + i;
			start = this.properties.start[i];
			this.tweenProperties[propertyName] = start;
			if(typeof(start) == "number" || typeof(start) == "number" && ((start | 0) === start)) {
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
			var _g = 0;
			var _g1 = this.properties.start.length;
			while(_g < _g1) {
				var i = _g++;
				this.currentParameters[i] = Reflect.field(this.tweenProperties,"param" + i);
			}
			var method = this.target;
			var params = this.currentParameters;
			if(params == null) {
				params = [];
			}
			method.apply(method,params);
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
			if(Object.prototype.hasOwnProperty.call(this.target,propertyName)) {
				this.target[propertyName] = (js_Boot.__cast(Reflect.field(this.properties,propertyName) , motion_IComponentPath)).get_end();
			} else {
				Reflect.setProperty(this.target,propertyName,(js_Boot.__cast(Reflect.field(this.properties,propertyName) , motion_IComponentPath)).get_end());
			}
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
				if(Object.prototype.hasOwnProperty.call(this.target,propertyName)) {
					path.set_start(Reflect.field(this.target,propertyName));
				} else {
					isField = false;
					path.set_start(Reflect.getProperty(this.target,propertyName));
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
			if(tweenPosition > 1) {
				tweenPosition = 1;
			}
			if(!this.initialized) {
				this.initialize();
			}
			if(!this.special) {
				easing = this._ease.calculate(tweenPosition);
				var _g = 0;
				var _g1 = this.propertyDetails;
				while(_g < _g1.length) {
					var details = _g1[_g];
					++_g;
					if(details.isField) {
						details.target[details.propertyName] = (js_Boot.__cast(details , motion_actuators_PropertyPathDetails)).path.calculate(easing);
					} else {
						Reflect.setProperty(details.target,details.propertyName,(js_Boot.__cast(details , motion_actuators_PropertyPathDetails)).path.calculate(easing));
					}
				}
			} else {
				if(!this._reverse) {
					easing = this._ease.calculate(tweenPosition);
				} else {
					easing = this._ease.calculate(1 - tweenPosition);
				}
				var endValue;
				var _g = 0;
				var _g1 = this.propertyDetails;
				while(_g < _g1.length) {
					var details = _g1[_g];
					++_g;
					if(!this._snapping) {
						if(details.isField) {
							details.target[details.propertyName] = (js_Boot.__cast(details , motion_actuators_PropertyPathDetails)).path.calculate(easing);
						} else {
							Reflect.setProperty(details.target,details.propertyName,(js_Boot.__cast(details , motion_actuators_PropertyPathDetails)).path.calculate(easing));
						}
					} else if(details.isField) {
						details.target[details.propertyName] = Math.round((js_Boot.__cast(details , motion_actuators_PropertyPathDetails)).path.calculate(easing));
					} else {
						Reflect.setProperty(details.target,details.propertyName,Math.round((js_Boot.__cast(details , motion_actuators_PropertyPathDetails)).path.calculate(easing)));
					}
				}
			}
			if(tweenPosition == 1) {
				if(this._repeat == 0) {
					this.active = false;
					var tmp;
					if(this.toggleVisible) {
						var target = this.target;
						var value = null;
						if(Object.prototype.hasOwnProperty.call(target,"alpha")) {
							value = Reflect.field(target,"alpha");
						} else {
							value = Reflect.getProperty(target,"alpha");
						}
						tmp = value == 0;
					} else {
						tmp = false;
					}
					if(tmp) {
						var target = this.target;
						var value = false;
						if(Object.prototype.hasOwnProperty.call(target,"visible")) {
							target["visible"] = value;
						} else {
							Reflect.setProperty(target,"visible",value);
						}
					}
					this.complete(true);
					return;
				} else {
					if(this._onRepeat != null) {
						var method = this._onRepeat;
						var params = this._onRepeatParams;
						if(params == null) {
							params = [];
						}
						method.apply(method,params);
					}
					if(this._reflect) {
						this._reverse = !this._reverse;
					}
					this.startTime = currentTime;
					this.timeOffset = this.startTime + this._delay;
					if(this._repeat > 0) {
						this._repeat--;
					}
				}
			}
			if(this.sendChange) {
				this.change();
			}
		}
	}
	,__class__: motion_actuators_MotionPathActuator
});
var motion_actuators_PropertyDetails = function(target,propertyName,start,change,isField) {
	if(isField == null) {
		isField = true;
	}
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
	if(isField == null) {
		isField = true;
	}
	motion_actuators_PropertyDetails.call(this,target,propertyName,0,0,isField);
	this.path = path;
};
motion_actuators_PropertyPathDetails.__name__ = true;
motion_actuators_PropertyPathDetails.__super__ = motion_actuators_PropertyDetails;
motion_actuators_PropertyPathDetails.prototype = $extend(motion_actuators_PropertyDetails.prototype,{
	__class__: motion_actuators_PropertyPathDetails
});
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
		if(blurInput == null) {
			blurInput = true;
		}
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
		if(blurInput) {
			this.seedMaterial.uniforms.tDiffuse.value = pong;
		} else {
			this.seedMaterial.uniforms.tDiffuse.value = texture;
		}
		this.seedMaterial.uniforms.texLevels.value = this.texLevels;
		this.renderer.render(this.scene,this.camera,ping,true);
		this.scene.overrideMaterial = this.floodMaterial;
		this.floodMaterial.uniforms.texLevels.value = this.texLevels;
		this.floodMaterial.uniforms.texw.value = width;
		this.floodMaterial.uniforms.texh.value = height;
		var stepSize = width > height ? width / 2 | 0 : height / 2 | 0;
		var last = ping;
		while(stepSize > 0) {
			this.floodMaterial.uniforms.tDiffuse.value = last;
			this.floodMaterial.uniforms.step.value = stepSize;
			if(last == ping) {
				last = pong;
			} else {
				last = ping;
			}
			this.renderer.render(this.scene,this.camera,last,true);
			stepSize = stepSize / 2 | 0;
		}
		this.scene.overrideMaterial = null;
		if(last != ping) {
			ping.dispose();
		}
		if(last != pong) {
			pong.dispose();
		}
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
var $_;
function $bind(o,m) { if( m == null ) return null; if( m.__id__ == null ) m.__id__ = $global.$haxeUID++; var f; if( o.hx__closures__ == null ) o.hx__closures__ = {}; else f = o.hx__closures__[m.__id__]; if( f == null ) { f = m.bind(o); o.hx__closures__[m.__id__] = f; } return f; }
$global.$haxeUID |= 0;
if(typeof(performance) != "undefined" ? typeof(performance.now) == "function" : false) {
	HxOverrides.now = performance.now.bind(performance);
}
if( String.fromCodePoint == null ) String.fromCodePoint = function(c) { return c < 0x10000 ? String.fromCharCode(c) : String.fromCharCode((c>>10)+0xD7C0)+String.fromCharCode((c&0x3FF)+0xDC00); }
String.prototype.__class__ = String;
String.__name__ = true;
Array.__name__ = true;
var Int = { };
var Dynamic = { };
var Float = Number;
var Bool = Boolean;
var Class = { };
var Enum = { };
haxe_ds_ObjectMap.count = 0;
js_Boot.__toStr = ({ }).toString;
Main.REPO_URL = "https://github.com/Tw1ddle/WebGL-Distance-Fields";
Main.WEBSITE_URL = "https://samcodes.co.uk/";
Main.TWITTER_URL = "https://twitter.com/Sam_Twidale";
Main.HAXE_URL = "https://haxe.org/";
Main.lastAnimationTime = 0.0;
Main.dt = 0.0;
Main.fieldsGenerated = 0;
dat_ThreeObjectGUI.guiItemCount = 0;
motion_actuators_SimpleActuator.actuators = [];
motion_actuators_SimpleActuator.actuatorsLength = 0;
motion_actuators_SimpleActuator.addedEvent = false;
motion_easing_Expo.easeIn = new motion_easing__$Expo_ExpoEaseIn();
motion_easing_Expo.easeInOut = new motion_easing__$Expo_ExpoEaseInOut();
motion_easing_Expo.easeOut = new motion_easing__$Expo_ExpoEaseOut();
motion_Actuate.defaultActuator = motion_actuators_SimpleActuator;
motion_Actuate.defaultEase = motion_easing_Expo.easeOut;
motion_Actuate.targetLibraries = new haxe_ds_ObjectMap();
sdf_shaders_Copy.uniforms = { tDiffuse : { type : "t", value : null}};
sdf_shaders_Copy.vertexShader = "varying vec2 vUv;\n\nvoid main()\n{\n\tvUv = uv;\n\tgl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);\n}";
sdf_shaders_Copy.fragmentShader = "varying vec2 vUv;\n\nuniform sampler2D tDiffuse;\n\nvoid main()\n{\n\tgl_FragColor = texture2D(tDiffuse, vUv);\n}";
sdf_shaders_EDT_$SEED.uniforms = { tDiffuse : { type : "t", value : null}, texLevels : { type : "f", value : 0.0}};
sdf_shaders_EDT_$SEED.vertexShader = "varying vec2 vUv;\n\nvoid main()\n{\n\tvUv = uv;\n\tgl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);\n}";
sdf_shaders_EDT_$SEED.fragmentShader = "// Jump flooding algorithm for Euclidean distance transform, according to Danielsson (1980) and Guodong Rong (2007).\n// This shader initializes the distance field in preparation for the flood filling.\n\n// Adapted for three.js demo by Sam Twidale.\n// Original implementation by Stefan Gustavson 2010.\n// This code is in the public domain.\n\nvarying vec2 vUv;\n\nuniform sampler2D tDiffuse;\nuniform float texLevels;\n\nvoid main()\n{\n\tfloat texel = texture2D(tDiffuse, vUv).r;\n\t\n\t// Represents zero\n\tfloat myzero = 0.5 * texLevels / (texLevels - 1.0);\n\t\n\t// Represents infinity/not-yet-calculated\n\tfloat myinfinity = 0.0;\n\t\n\t// Sub-pixel AA distance\n\tfloat aadist = texel;\n\t\n\t// Pixels > 0.5 are objects, others are background\n\tgl_FragColor = vec4(vec2(texel > 0.99999 ? myinfinity : myzero), aadist, 1.0);\n}";
sdf_shaders_EDT_$FLOOD.uniforms = { tDiffuse : { type : "t", value : null}, texLevels : { type : "f", value : 0.0}, texw : { type : "f", value : 0.0}, texh : { type : "f", value : 0.0}, step : { type : "f", value : 0.0}};
sdf_shaders_EDT_$FLOOD.vertexShader = "// Jump flooding algorithm for Euclidean distance transform, according to Danielsson (1980) and Guodong Rong (2007).\n// This code represents one iteration of the flood filling.\n// You need to run it multiple times with different step lengths to perform a full distance transformation.\n\n// Adapted for three.js demo by Sam Twidale.\n// Original implementation by Stefan Gustavson 2010.\n// This code is in the public domain.\n\nvarying vec2 vUv;\nvarying float stepu;\nvarying float stepv;\n\nuniform float step;\nuniform float texw;\nuniform float texh;\n\nvoid main()\n{\n\t// Saves a division in the fragment shader\n\tstepu = step / texw;\n\tstepv = step / texh;\n\t\n\tvUv = uv;\t\n\tgl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);\n}";
sdf_shaders_EDT_$FLOOD.fragmentShader = "// Jump flooding algorithm for Euclidean distance transform, according to Danielsson (1980) and Guodong Rong (2007).\n// This code represents one iteration of the flood filling.\n// You need to run it multiple times with different step lengths to perform a full distance transformation.\n\n// Adapted for three.js demo by Sam Twidale.\n// Original implementation by Stefan Gustavson 2010.\n// This code is in the public domain.\n\nvarying vec2 vUv;\nvarying float stepu;\nvarying float stepv;\n\nuniform sampler2D tDiffuse;\nuniform float texw;\nuniform float texh;\nuniform float texLevels;\n\n// Helper function to remap unsigned normalized floats [0.0..1.0]\n// coming from a texture stored in integer format internally to a\n// signed float vector pointing exactly to a pixel centre in texture\n// space. The range of valid vectors is\n// [-1.0+0.5/texsize, 1.0-0.5/texsize], with the special value\n// -1.0-0.5*texsize (represented as integer 0) meaning\n// \"distance vector still undetermined\".\n// The mapping is carefully designed to map both 8 bit and 16\n// bit integer texture data to distinct and exact floating point\n// texture coordinate offsets and vice versa.\n// 8 bit integer textures can be used to transform images up to\n// size 128x128 pixels, and 16 bit integer textures can be used to\n// transform images up to 32768x32768, i.e. beyond the largest\n// texture size available in current implementations of OpenGL.\n// Direct use of integers in the shader (by means of texture2DRect\n// and GL_RG8I and GL_RG16I texture formats) could be faster, but-1\n// this code is conveniently compatible even with version 1.2 of GLSL\n// (i.e. OpenGL 2.1), and the main shader is limited by texture access\n// and branching, not ALU capacity, so a few extra multiplications\n// for indexing and output storage are not that bad.\nvec2 remap(vec2 floatdata)\n{\n     return floatdata * (texLevels - 1.0) / texLevels * 2.0 - 1.0;\n}\n\nvec2 remap_inv(vec2 floatvec)\n{\n     return (floatvec + 1.0) * 0.5 * texLevels / (texLevels - 1.0);\n}\n\n// TODO this isn't ideal, also will it work for most texture sizes?\nvec3 sampleTexture(sampler2D texture, vec2 vec)\n{\n\t// The algorithm depends on the texture having a CLAMP_TO_BORDER attribute and a border color with R = 0.\n\t// These explicit conditionals to avoid propagating incorrect vectors when looking outside of [0,1] in UV cause a slowdown of about 25%.\n\tif(vec.x >= 1.0 || vec.y >= 1.0 || vec.x <= 0.0 || vec.y <= 0.0)\n\t{\n\t\tvec = clamp(vec, 0.0, 1.0);\n\t\treturn vec3(0.0, 0.0, 0.0);\n\t}\n\t\n\treturn texture2D(texture, vec).rgb;\n}\n\nvoid testCandidate(in vec2 stepvec, inout vec4 bestseed)\n{\n\tvec2 newvec = vUv + stepvec; // Absolute position of that candidate\n\tvec3 texel = sampleTexture(tDiffuse, newvec).rgb;\n\tvec4 newseed; // Closest point from that candidate (xy), its AA distance (z) and its grayscale value (w)\n\tnewseed.xy = remap(texel.rg);\n\tif(newseed.x > -0.99999) // If the new seed is not \"indeterminate distance\"\n\t{\n\t\tnewseed.xy = newseed.xy + stepvec;\n\t\t\n\t\t// TODO: implement better equations for calculating the AA distance\n\t\t// Try by getting the direction of the edge using the gradients of nearby edge pixels \n\t\t\n\t\tfloat di = length(newseed.xy);\n\t\tfloat df = texel.b - 0.5;\n\t\t\n\t\t// TODO: This AA assumes texw == texh. It does not allow for non-square textures.\n\t\tnewseed.z = di + (df / texw);\n\t\tnewseed.w = texel.b;\n\t\t\n\t\tif(newseed.z < bestseed.z)\n\t\t{\n\t\t\tbestseed = newseed;\n\t\t}\n\t}\n}\n\nvoid main()\n{\n\t// Searches for better distance vectors among 8 candidates\n\tvec3 texel = sampleTexture(tDiffuse, vUv).rgb;\n\t\n\t// Closest seed so far\n\tvec4 bestseed;\n\tbestseed.xy = remap(texel.rg);\n\tbestseed.z = length(bestseed.xy) + (texel.b - 0.5) / texw; // Add AA edge offset to distance\n\tbestseed.w = texel.b; // Save AA/grayscale value\n\t\n\ttestCandidate(vec2(-stepu, -stepv), bestseed);\n\ttestCandidate(vec2(-stepu, 0.0), bestseed);\n\ttestCandidate(vec2(-stepu, stepv), bestseed);\n\ttestCandidate(vec2(0.0, -stepv), bestseed);\n\ttestCandidate(vec2(0.0, stepv), bestseed);\n\ttestCandidate(vec2(stepu, -stepv), bestseed);\n\ttestCandidate(vec2(stepu, 0.0), bestseed);\n\ttestCandidate(vec2(stepu, stepv), bestseed);\n\t\n\tgl_FragColor = vec4(remap_inv(bestseed.xy), bestseed.w, 1.0);\n}";
sdf_shaders_EDT_$DISPLAY_$AA.uniforms = { tDiffuse : { type : "t", value : null}, texw : { type : "f", value : 0.0}, texh : { type : "f", value : 0.0}, texLevels : { type : "f", value : 0.0}, threshold : { type : "f", value : 0.0, min : 0.0, max : 1.0}};
sdf_shaders_EDT_$DISPLAY_$AA.vertexShader = "// Adapted for three.js demo by Sam Twidale.\n// Original implementation by Stefan Gustavson 2010.\n// This code is in the public domain.\n\nvarying vec2 vUv;\nvarying float oneu;\nvarying float onev;\n\nuniform float texw;\nuniform float texh;\n\nvoid main()\n{\n\tvUv = uv;\n\t\n\t// Save divisions in some of the fragment shaders\n\toneu = 1.0 / texw;\n\tonev = 1.0 / texh;\n\t\n\tgl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);\n}";
sdf_shaders_EDT_$DISPLAY_$AA.fragmentShader = "// Distance map contour texturing.\n// A reimplementation of Greens method, with a 16-bit 8:8 distance map and explicit bilinear interpolation.\n\n// Adapted for three.js demo by Sam Twidale.\n// Original implementation by Stefan Gustavson 2011.\n// This code is in the public domain.\n\nvarying vec2 vUv;\nvarying float oneu;\nvarying float onev;\n\nuniform sampler2D tDiffuse;\nuniform float texw;\nuniform float texh;\nuniform float texLevels;\nuniform float threshold;\n\n// Replacement for RSLs filterstep(), with fwidth() done right.\n// threshold is constant, value is smoothly varying\nfloat aastep(float threshold, float value)\n{\n\tfloat afwidth = 0.7 * length(vec2(dFdx(value), dFdy(value)));\n\treturn smoothstep(threshold - afwidth, threshold + afwidth, value); // GLSLs fwidth(value) is abs(dFdx(value)) + abs(dFdy(value))\n}\n\n// Helper functions to remap unsigned normalized floats [0.0, 1.0] coming from an integer texture to the range we need [-1, 1].\n// The transformations are very specifically designed to map integer texel values exactly to pixel centers, and vice versa.\nvec2 remap(vec2 floatdata)\n{\n\treturn floatdata * (texLevels - 1.0) / texLevels * 2.0 - 1.0;\n}\n\nvoid main()\n{\n\t// Scale texcoords to range ([0, texw], [0, texh])\n\tvec2 uv = vUv * vec2(texw, texh);\n\t\n\t// Compute texel-local (u,v) coordinates for the four closest texels\n\tvec2 uv00 = floor(uv - vec2(0.5)); // Lower left corner of lower left texel\n\tvec2 uvlerp = uv - uv00 - vec2(0.5); // Texel-local lerp blends [0,1]\n\t\n\t// Center st00 on lower left texel and rescale to [0,1] for texture lookup\n\tvec2 st00 = (uv00 + vec2(0.5)) * vec2(oneu, onev);\n\t\n\t// Compute distance value from four closest 8-bit RGBA texels\n\tvec4 T00 = texture2D(tDiffuse, st00);\n\tvec4 T10 = texture2D(tDiffuse, st00 + vec2(oneu, 0.0));\n\tvec4 T01 = texture2D(tDiffuse, st00 + vec2(0.0, onev));\n\tvec4 T11 = texture2D(tDiffuse, st00 + vec2(oneu, onev));\n\tfloat D00 = length(remap(T00.rg)) + (T00.b - 0.5) / texw;\n\tfloat D10 = length(remap(T10.rg)) + (T10.b - 0.5) / texw;\n\tfloat D01 = length(remap(T01.rg)) + (T01.b - 0.5) / texw;\n\tfloat D11 = length(remap(T11.rg)) + (T11.b - 0.5) / texw;\n\t\n\t// Interpolate along v\n\tvec2 D0_1 = mix(vec2(D00, D10), vec2(D01, D11), uvlerp.y);\n\t\n\t// Interpolate along u\n\tfloat D = mix(D0_1.x, D0_1.y, uvlerp.x);\n\t\n\tfloat g = aastep(threshold, D);\n\t\n\t// Final fragment color\n\tgl_FragColor = vec4(vec3(g), 1.0);\n}";
sdf_shaders_EDT_$DISPLAY_$OVERLAY.uniforms = { tDiffuse : { type : "t", value : null}, texw : { type : "f", value : 0.0}, texh : { type : "f", value : 0.0}, texLevels : { type : "f", value : 0.0}, threshold : { type : "f", value : 0.0, min : 0.0, max : 1.0}};
sdf_shaders_EDT_$DISPLAY_$OVERLAY.vertexShader = "// Adapted for three.js demo by Sam Twidale.\n// Original implementation by Stefan Gustavson 2010.\n// This code is in the public domain.\n\nvarying vec2 vUv;\nvarying float oneu;\nvarying float onev;\n\nuniform float texw;\nuniform float texh;\n\nvoid main()\n{\n\tvUv = uv;\n\t\n\t// Save divisions in some of the fragment shaders\n\toneu = 1.0 / texw;\n\tonev = 1.0 / texh;\n\t\n\tgl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);\n}";
sdf_shaders_EDT_$DISPLAY_$OVERLAY.fragmentShader = "// Distance map contour texturing.\n// A reimplementation of Greens method, with a 16-bit 8:8 distance map and explicit bilinear interpolation.\n\n// Adapted for three.js demo by Sam Twidale.\n// Original implementation by Stefan Gustavson 2011.\n// This code is in the public domain.\n\nvarying vec2 vUv;\nvarying float oneu;\nvarying float onev;\n\nuniform sampler2D tDiffuse;\nuniform float texw;\nuniform float texh;\nuniform float texLevels;\nuniform float threshold;\n\n// Replacement for RSLs filterstep(), with fwidth() done right.\n// threshold is constant, value is smoothly varying\nfloat aastep(float threshold, float value)\n{\n\tfloat afwidth = 0.7 * length(vec2(dFdx(value), dFdy(value)));\n\treturn smoothstep(threshold - afwidth, threshold + afwidth, value); // GLSLs fwidth(value) is abs(dFdx(value)) + abs(dFdy(value))\n}\n\n// Helper functions to remap unsigned normalized floats [0.0, 1.0] coming from an integer texture to the range we need [-1, 1].\n// The transformations are very specifically designed to map integer texel values exactly to pixel centers, and vice versa.\nvec2 remap(vec2 floatdata)\n{\n\treturn floatdata * (texLevels - 1.0) / texLevels * 2.0 - 1.0;\n}\n\nvoid main()\n{\n\t// Scale texcoords to range ([0, texw], [0, texh])\n\tvec2 uv = vUv * vec2(texw, texh);\n\t\n\t// Compute texel-local (u,v) coordinates for the four closest texels\n\tvec2 uv00 = floor(uv - vec2(0.5)); // Lower left corner of lower left texel\n\tvec2 uvlerp = uv - uv00 - vec2(0.5); // Texel-local lerp blends [0,1]\n\t\n\t// Center st00 on lower left texel and rescale to [0,1] for texture lookup\n\tvec2 st00 = (uv00 + vec2(0.5)) * vec2(oneu, onev);\n\t\n\t// Compute distance value from four closest 8-bit RGBA texels\n\tvec4 T00 = texture2D(tDiffuse, st00);\n\tvec4 T10 = texture2D(tDiffuse, st00 + vec2(oneu, 0.0));\n\tvec4 T01 = texture2D(tDiffuse, st00 + vec2(0.0, onev));\n\tvec4 T11 = texture2D(tDiffuse, st00 + vec2(oneu, onev));\n\tfloat D00 = length(remap(T00.rg)) + (T00.b - 0.5) / texw;\n\tfloat D10 = length(remap(T10.rg)) + (T10.b - 0.5) / texw;\n\tfloat D01 = length(remap(T01.rg)) + (T01.b - 0.5) / texw;\n\tfloat D11 = length(remap(T11.rg)) + (T11.b - 0.5) / texw;\n\t\n\t// Interpolate along v\n\tvec2 D0_1 = mix(vec2(D00, D10), vec2(D01, D11), uvlerp.y);\n\t\n\t// Interpolate along u\n\tfloat D = mix(D0_1.x, D0_1.y, uvlerp.x);\n\t\n\tfloat g = aastep(threshold, D);\n\t\n\t// Retrieve the B channel to get the original grayscale image\n\tfloat c = texture2D(tDiffuse, vUv).b;\n\t\n\t// Final fragment color\n\tgl_FragColor = vec4(vec3(g, c, g), 1.0);\n}";
sdf_shaders_EDT_$DISPLAY_$RGB.uniforms = { tDiffuse : { type : "t", value : null}, texw : { type : "f", value : 0.0}, texh : { type : "f", value : 0.0}, texLevels : { type : "f", value : 0.0}};
sdf_shaders_EDT_$DISPLAY_$RGB.vertexShader = "// Adapted for three.js demo by Sam Twidale.\n// Original implementation by Stefan Gustavson 2010.\n// This code is in the public domain.\n\nvarying vec2 vUv;\nvarying float oneu;\nvarying float onev;\n\nuniform float texw;\nuniform float texh;\n\nvoid main()\n{\n\tvUv = uv;\n\t\n\t// Save divisions in some of the fragment shaders\n\toneu = 1.0 / texw;\n\tonev = 1.0 / texh;\n\t\n\tgl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);\n}";
sdf_shaders_EDT_$DISPLAY_$RGB.fragmentShader = "// Displays the final distance field visualized as an RGB image.\n\n// Adapted for three.js demo by Sam Twidale.\n// Original implementation by Stefan Gustavson 2010.\n// This code is in the public domain.\n\nvarying vec2 vUv;\n\nuniform sampler2D tDiffuse;\nuniform float texw;\nuniform float texh;\nuniform float texLevels;\n\n// Helper functions to remap unsigned normalized floats [0.0, 1.0] coming from an integer texture to the range we need [-1, 1].\n// The transformations are very specifically designed to map integer texel values exactly to pixel centers, and vice versa.\nvec2 remap(vec2 floatdata)\n{\n\treturn floatdata * (texLevels - 1.0) / texLevels * 2.0 - 1.0;\n}\n\nvoid main()\n{\n\tvec3 texel = texture2D(tDiffuse, vUv).rgb;\n\tvec2 distvec = remap(texel.rg);\n\t\n    //vec2 rainbow = 0.5 + 0.5 * (normalize(distvec));\n    //gl_FragColor = vec4(rainbow, 1.0 - (length(distvec) + texel.b - 0.5) * 4.0, 1.0);\n\t\n\tfloat dist = length(distvec) + (texel.b - 0.5) / texw;\n\tgl_FragColor = vec4(vec2(mod(10.0 * dist, 1.0)), texel.b, 1.0);\n}";
sdf_shaders_EDT_$DISPLAY_$GRAYSCALE.uniforms = { tDiffuse : { type : "t", value : null}, texw : { type : "f", value : 0.0}, texh : { type : "f", value : 0.0}, texLevels : { type : "f", value : 0.0}, distanceFactor : { type : "f", value : 30.0}};
sdf_shaders_EDT_$DISPLAY_$GRAYSCALE.vertexShader = "// Adapted for three.js demo by Sam Twidale.\n// Original implementation by Stefan Gustavson 2010.\n// This code is in the public domain.\n\nvarying vec2 vUv;\nvarying float oneu;\nvarying float onev;\n\nuniform float texw;\nuniform float texh;\n\nvoid main()\n{\n\tvUv = uv;\n\t\n\t// Save divisions in some of the fragment shaders\n\toneu = 1.0 / texw;\n\tonev = 1.0 / texh;\n\t\n\tgl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);\n}";
sdf_shaders_EDT_$DISPLAY_$GRAYSCALE.fragmentShader = "// This code is in the public domain.\n\nvarying vec2 vUv;\nvarying float oneu;\nvarying float onev;\n\nuniform sampler2D tDiffuse;\nuniform float texw;\nuniform float texh;\nuniform float texLevels;\nuniform float threshold;\nuniform float distanceFactor;\n\n// Helper functions to remap unsigned normalized floats [0.0, 1.0] coming from an integer texture to the range we need [-1, 1].\n// The transformations are very specifically designed to map integer texel values exactly to pixel centers, and vice versa.\nvec2 remap(vec2 floatdata)\n{\n\treturn floatdata * (texLevels - 1.0) / texLevels * 2.0 - 1.0;\n}\n\nvoid main()\n{\n\t// Scale texcoords to range ([0, texw], [0, texh])\n\tvec2 uv = vUv * vec2(texw, texh);\n\t\n\t// Compute texel-local (u,v) coordinates for the four closest texels\n\tvec2 uv00 = floor(uv - vec2(0.5)); // Lower left corner of lower left texel\n\tvec2 uvlerp = uv - uv00 - vec2(0.5); // Texel-local lerp blends [0,1]\n\t\n\t// Center st00 on lower left texel and rescale to [0,1] for texture lookup\n\tvec2 st00 = (uv00 + vec2(0.5)) * vec2(oneu, onev);\n\t\n\t// Compute distance value from four closest 8-bit RGBA texels\n\tvec4 T00 = texture2D(tDiffuse, st00);\n\tvec4 T10 = texture2D(tDiffuse, st00 + vec2(oneu, 0.0));\n\tvec4 T01 = texture2D(tDiffuse, st00 + vec2(0.0, onev));\n\tvec4 T11 = texture2D(tDiffuse, st00 + vec2(oneu, onev));\n\tfloat D00 = length(remap(T00.rg)) + (T00.b - 0.5) / texw;\n\tfloat D10 = length(remap(T10.rg)) + (T10.b - 0.5) / texw;\n\tfloat D01 = length(remap(T01.rg)) + (T01.b - 0.5) / texw;\n\tfloat D11 = length(remap(T11.rg)) + (T11.b - 0.5) / texw;\n\t\n\t// Interpolate along v\n\tvec2 D0_1 = mix(vec2(D00, D10), vec2(D01, D11), uvlerp.y);\n\t\n\t// Interpolate along u\n\tfloat D = mix(D0_1.x, D0_1.y, uvlerp.x) * distanceFactor;\n\t\n\t// Final fragment color\n\tgl_FragColor = vec4(vec3(D), 1.0);\n}";
sdf_shaders_EDT_$DISPLAY_$ALPHA_$THRESHOLD.uniforms = { tDiffuse : { type : "t", value : null}, texw : { type : "f", value : 0.0}, texh : { type : "f", value : 0.0}, texLevels : { type : "f", value : 0.0}, threshold : { type : "f", value : 0.0, min : 0.0, max : 1.0}};
sdf_shaders_EDT_$DISPLAY_$ALPHA_$THRESHOLD.vertexShader = "// Adapted for three.js demo by Sam Twidale.\n// Original implementation by Stefan Gustavson 2010.\n// This code is in the public domain.\n\nvarying vec2 vUv;\nvarying float oneu;\nvarying float onev;\n\nuniform float texw;\nuniform float texh;\n\nvoid main()\n{\n\tvUv = uv;\n\t\n\t// Save divisions in some of the fragment shaders\n\toneu = 1.0 / texw;\n\tonev = 1.0 / texh;\n\t\n\tgl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);\n}";
sdf_shaders_EDT_$DISPLAY_$ALPHA_$THRESHOLD.fragmentShader = "// Distance map contour texturing.\n// Simple alpha thresholding, produces wavey contours.\n\n// Adapted for three.js demo by Sam Twidale.\n// Original implementation by Stefan Gustavson 2011.\n// This code is in the public domain.\n\nvarying vec2 vUv;\nvarying float oneu;\nvarying float onev;\n\nuniform sampler2D tDiffuse;\nuniform float texw;\nuniform float texh;\nuniform float texLevels;\nuniform float threshold;\n\n// Replacement for RSLs filterstep(), with fwidth() done right.\n// threshold is constant, value is smoothly varying\nfloat aastep(float threshold, float value)\n{\n\tfloat afwidth = 0.7 * length(vec2(dFdx(value), dFdy(value)));\n\treturn smoothstep(threshold - afwidth, threshold + afwidth, value); // GLSLs fwidth(value) is abs(dFdx(value)) + abs(dFdy(value))\n}\n\nvoid main()\n{\n\t// Scale texcoords to range ([0, texw], [0, texh])\n\tvec2 uv = vUv * vec2(texw, texh);\n\t\n\t// Compute texel-local (u,v) coordinates for the four closest texels\n\tvec2 uv00 = floor(uv - vec2(0.5)); // Lower left corner of lower left texel\n\tvec2 uvlerp = uv - uv00 - vec2(0.5); // Texel-local lerp blends [0,1]\n\t\n\t// Center st00 on lower left texel and rescale to [0,1] for texture lookup\n\tvec2 st00 = (uv00 + vec2(0.5)) * vec2(oneu, onev);\n\t\n\t// Compute distance value from four closest 8-bit RGBA texels\n\tvec4 D00 = texture2D(tDiffuse, st00);\n\tvec4 D10 = texture2D(tDiffuse, st00 + vec2(oneu, 0.0));\n\tvec4 D01 = texture2D(tDiffuse, st00 + vec2(0.0, onev));\n\tvec4 D11 = texture2D(tDiffuse, st00 + vec2(oneu, onev));\n\n\t// Retrieve the B channel to get the original grayscale image\n\tvec4 G = vec4(D00.b, D01.b, D10.b, D11.b);\n  \n\t// Interpolate along v\n\tG.xy = mix(G.xz, G.yw, uvlerp.y);\n\n\t// Interpolate along u\n\tfloat g = mix(G.x, G.y, uvlerp.x);\n\n\tfloat c = aastep(threshold, g);\n\t\n\t// Final fragment color\n\tgl_FragColor = vec4(vec3(c), 1.0);\n}";
sdf_shaders_GaussianBlur.uniforms = (function($this) {
	var $r;
	var tmp = { type : "v2", value : new THREE.Vector2(0,0)};
	$r = { tDiffuse : { type : "t", value : null}, direction : tmp, resolution : { type : "v2", value : new THREE.Vector2(1024.0,1024.0)}, flip : { type : "i", value : 0}};
	return $r;
}(this));
sdf_shaders_GaussianBlur.vertexShader = "varying vec2 vUv;\n\nvoid main()\n{\n\tvUv = uv;\n\tgl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);\n}";
sdf_shaders_GaussianBlur.fragmentShader = "// Efficient Gaussian blur with linear sampling, based on https://github.com/Jam3/glsl-fast-gaussian-blur by Jam3\n// Also see http://rastergrid.com/blog/2010/09/efficient-gaussian-blur-with-linear-sampling/ by Daniel Rakos\n// Must use on a texture that has linear (gl.LINEAR) filtering, the linear sampling approach requires this to get info about two adjacent pixels from one texture read, making it faster than discrete sampling\n// Requires a horizontal and vertical pass to perform the full blur. It is written this way because a single pass involves many more texture reads\n\nvarying vec2 vUv;\n\nuniform sampler2D tDiffuse;\nuniform vec2 resolution;\nuniform vec2 direction;\nuniform int flip;\n\nvoid main()\n{\n\tvec2 uv = vUv;\n\t\n\tif(flip != 0)\n\t{\n\t\tuv.y = 1.0 - uv.y;\n\t}\n\t\n\tvec2 offset = vec2(1.3333333333333333) * direction;\n\tvec4 color = vec4(0.0);\n\tcolor += texture2D(tDiffuse, uv) * 0.29411764705882354;\n\tcolor += texture2D(tDiffuse, uv + (offset / resolution)) * 0.35294117647058826;\n\tcolor += texture2D(tDiffuse, uv - (offset / resolution)) * 0.35294117647058826;\n\tgl_FragColor = color;\n}";
shaders_EDT_$DISPLAY_$DEMO.uniforms = { tDiffuse : { type : "t", value : null}, texw : { type : "f", value : 0.0}, texh : { type : "f", value : 0.0}, texLevels : { type : "f", value : 0.0}, alpha : { type : "f", value : 1.0}, threshold : { type : "f", value : 0.0, min : 0.0, max : 1.0}, color : { type : "v3", value : new THREE.Vector3(0.0,0.0,1.0)}};
shaders_EDT_$DISPLAY_$DEMO.vertexShader = "// Adapted for three.js demo by Sam Twidale.\n// Original implementation by Stefan Gustavson 2010.\n// This code is in the public domain.\n\nvarying vec2 vUv;\nvarying float oneu;\nvarying float onev;\n\nuniform float texw;\nuniform float texh;\n\nvoid main()\n{\n\tvUv = uv;\n\t\n\t// Save divisions in some of the fragment shaders\n\toneu = 1.0 / texw;\n\tonev = 1.0 / texh;\n\t\n\tgl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);\n}";
shaders_EDT_$DISPLAY_$DEMO.fragmentShader = "// Distance map contour texturing.\n// A reimplementation of Greens method, with a 16-bit 8:8 distance map and explicit bilinear interpolation.\n\n// Adapted for three.js demo by Sam Twidale.\n// Original implementation by Stefan Gustavson 2011.\n// This code is in the public domain.\n\nvarying vec2 vUv;\nvarying float oneu;\nvarying float onev;\n\nuniform sampler2D tDiffuse;\nuniform float texw;\nuniform float texh;\nuniform float texLevels;\nuniform float threshold;\nuniform float alpha;\nuniform vec3 color;\n\n// Replacement for RSLs filterstep(), with fwidth() done right.\n// threshold is constant, value is smoothly varying\nfloat aastep(float threshold, float value)\n{\n\tfloat afwidth = 0.7 * length(vec2(dFdx(value), dFdy(value)));\n\treturn smoothstep(threshold - afwidth, threshold + afwidth, value); // GLSLs fwidth(value) is abs(dFdx(value)) + abs(dFdy(value))\n}\n\n// Helper functions to remap unsigned normalized floats [0.0, 1.0] coming from an integer texture to the range we need [-1, 1].\n// The transformations are very specifically designed to map integer texel values exactly to pixel centers, and vice versa.\nvec2 remap(vec2 floatdata)\n{\n\treturn floatdata * (texLevels - 1.0) / texLevels * 2.0 - 1.0;\n}\n\nvoid main()\n{\n\t// Scale texcoords to range ([0, texw], [0, texh])\n\tvec2 uv = vUv * vec2(texw, texh);\n\t\n\t// Compute texel-local (u,v) coordinates for the four closest texels\n\tvec2 uv00 = floor(uv - vec2(0.5)); // Lower left corner of lower left texel\n\tvec2 uvlerp = uv - uv00 - vec2(0.5); // Texel-local lerp blends [0,1]\n\t\n\t// Center st00 on lower left texel and rescale to [0,1] for texture lookup\n\tvec2 st00 = (uv00 + vec2(0.5)) * vec2(oneu, onev);\n\t\n\t// Compute distance value from four closest 8-bit RGBA texels\n\tvec4 T00 = texture2D(tDiffuse, st00);\n\tvec4 T10 = texture2D(tDiffuse, st00 + vec2(oneu, 0.0));\n\tvec4 T01 = texture2D(tDiffuse, st00 + vec2(0.0, onev));\n\tvec4 T11 = texture2D(tDiffuse, st00 + vec2(oneu, onev));\n\tfloat D00 = length(remap(T00.rg)) + (T00.b - 0.5) / texw;\n\tfloat D10 = length(remap(T10.rg)) + (T10.b - 0.5) / texw;\n\tfloat D01 = length(remap(T01.rg)) + (T01.b - 0.5) / texw;\n\tfloat D11 = length(remap(T11.rg)) + (T11.b - 0.5) / texw;\n\t\n\t// Interpolate along v\n\tvec2 D0_1 = mix(vec2(D00, D10), vec2(D01, D11), uvlerp.y);\n\t\n\t// Interpolate along u\n\tfloat D = mix(D0_1.x, D0_1.y, uvlerp.x);\n\t\n\tfloat g = aastep(threshold, D);\n\t\n\tfloat a = min(g, alpha);\n\t\n\t// Final fragment color\n\tif(g > 0.02)\n\t{\n\t\tgl_FragColor = vec4(color, a);\n\t}\n\telse\n\t{\n\t\tgl_FragColor = vec4(vec3(g), a);\n\t}\n}";
shaders_FXAA.uniforms = { tDiffuse : { type : "t", value : null}, resolution : { type : "v2", value : new THREE.Vector2(1024.0,1024.0)}};
shaders_FXAA.vertexShader = "varying vec2 vUv;\n\nvoid main()\n{\n\tvUv = uv;\n\tgl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);\n}";
shaders_FXAA.fragmentShader = "// Fast approximate anti-aliasing shader\n// Based on the three.js implementation: https://github.com/mrdoob/three.js/blob/master/examples/js/shaders/FXAAShader.js\n// Ported to three.js by alteredq: http://alteredqualia.com/ and davidedc: http://www.sketchpatch.net/\n// Ported to WebGL by @supereggbert: http://www.geeks3d.com/20110405/fxaa-fast-approximate-anti-aliasing-demo-glsl-opengl-test-radeon-geforce/\n// Originally implemented as NVIDIA FXAA by Timothy Lottes: http://timothylottes.blogspot.com/2011/06/fxaa3-source-released.html\n// Paper: http://developer.download.nvidia.com/assets/gamedev/files/sdk/11/FXAA_WhitePaper.pdf\n\n#define FXAA_REDUCE_MIN (1.0/128.0)\n#define FXAA_REDUCE_MUL (1.0/8.0)\n#define FXAA_SPAN_MAX 8.0\n\nvarying vec2 vUv;\n\nuniform sampler2D tDiffuse;\nuniform vec2 resolution;\n\nvoid main()\n{\n\tvec2 rres = vec2(1.0) / resolution;\n\t\n\t// Texture lookups to find RGB values in area of current fragment\n\tvec3 rgbNW = texture2D(tDiffuse, (gl_FragCoord.xy + vec2(-1.0, -1.0)) * rres).xyz;\n\tvec3 rgbNE = texture2D(tDiffuse, (gl_FragCoord.xy + vec2(1.0, -1.0)) * rres).xyz;\n\tvec3 rgbSW = texture2D(tDiffuse, (gl_FragCoord.xy + vec2(-1.0, 1.0)) * rres).xyz;\n\tvec3 rgbSE = texture2D(tDiffuse, (gl_FragCoord.xy + vec2(1.0, 1.0)) * rres).xyz;\n\tvec4 rgbaM = texture2D(tDiffuse, gl_FragCoord.xy  * rres);\n\tvec3 rgbM = rgbaM.xyz;\n\tfloat opacity = rgbaM.w;\n\t\n\t// Luminance estimates for colors around current fragment\n\tvec3 luma = vec3(0.299, 0.587, 0.114);\n\tfloat lumaNW = dot(rgbNW, luma);\n\tfloat lumaNE = dot(rgbNE, luma);\n\tfloat lumaSW = dot(rgbSW, luma);\n\tfloat lumaSE = dot(rgbSE, luma);\n\tfloat lumaM  = dot(rgbM, luma);\n\tfloat lumaMin = min(lumaM, min(min(lumaNW, lumaNE), min(lumaSW, lumaSE)));\n\tfloat lumaMax = max(lumaM, max(max(lumaNW, lumaNE), max(lumaSW, lumaSE)));\n\n\t// \n\tvec2 dir;\n\tdir.x = -((lumaNW + lumaNE) - (lumaSW + lumaSE));\n\tdir.y =  ((lumaNW + lumaSW) - (lumaNE + lumaSE));\n\n\tfloat dirReduce = max((lumaNW + lumaNE + lumaSW + lumaSE) * (0.25 * FXAA_REDUCE_MUL), FXAA_REDUCE_MIN);\n\n\tfloat rcpDirMin = 1.0 / (min(abs(dir.x), abs(dir.y)) + dirReduce);\n\tdir = min(vec2(FXAA_SPAN_MAX, FXAA_SPAN_MAX), max(vec2(-FXAA_SPAN_MAX, -FXAA_SPAN_MAX), dir * rcpDirMin)) * rres;\n\n\tvec3 rgbA = 0.5 * (texture2D(tDiffuse, gl_FragCoord.xy * rres + dir * (1.0 / 3.0 - 0.5 )).xyz + texture2D(tDiffuse, gl_FragCoord.xy * rres + dir * (2.0 / 3.0 - 0.5)).xyz);\n\tvec3 rgbB = rgbA * 0.5 + 0.25 * (texture2D(tDiffuse, gl_FragCoord.xy * rres + dir * -0.5).xyz + texture2D(tDiffuse, gl_FragCoord.xy * rres + dir * 0.5).xyz);\n\n\tfloat lumaB = dot(rgbB, luma);\n\t\n\tif ((lumaB < lumaMin) || (lumaB > lumaMax))\n\t{\n\t\tgl_FragColor = vec4(rgbA, opacity);\n\t}\n\telse\n\t{\n\t\tgl_FragColor = vec4(rgbB, opacity);\n\t}\n}";
Main.main();
})(typeof window != "undefined" ? window : typeof global != "undefined" ? global : typeof self != "undefined" ? self : this);
