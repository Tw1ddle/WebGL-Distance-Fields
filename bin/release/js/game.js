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
	this.signal_letterTyped = new msignal_Signal1();
	this.signal_windowResized = new msignal_Signal0();
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
				unsupportedInfo.innerHTML = "Your browser does not support WebGL. Click <a href=\"" + "https://github.com/Tw1ddle/Box" + "\" target=\"_blank\">here for project info</a> instead.";
				break;
			case 1:
				unsupportedInfo.innerHTML = "Your browser supports WebGL, but the feature appears to be disabled. Click <a href=\"" + "https://github.com/Tw1ddle/Box" + "\" target=\"_blank\">here for project info</a> instead.";
				break;
			default:
				unsupportedInfo.innerHTML = "Could not detect WebGL support. Click <a href=\"" + "https://github.com/Tw1ddle/Box" + "\" target=\"_blank\">here for project info</a> instead.";
			}
			gameDiv.appendChild(unsupportedInfo);
			return;
		}
		this.gameAttachPoint = window.document.getElementById("game");
		this.gameAttachPoint.appendChild(gameDiv);
		this.renderer = new THREE.WebGLRenderer({ antialias : true});
		this.renderer.context.getExtension("OES_standard_derivatives");
		this.renderer.sortObjects = false;
		this.renderer.autoClear = false;
		this.renderer.setClearColor(new THREE.Color(16711680));
		this.renderer.setPixelRatio(window.devicePixelRatio);
		var width = window.innerWidth * this.renderer.getPixelRatio();
		var height = window.innerHeight * this.renderer.getPixelRatio();
		this.worldScene = new THREE.Scene();
		this.worldCamera = new THREE.PerspectiveCamera(75,width / height,20,70000);
		this.worldCamera.position.z = 500;
		this.aaPass = new THREE.ShaderPass({ vertexShader : shaders_BasicFXAA.vertexShader, fragmentShader : shaders_BasicFXAA.fragmentShader, uniforms : shaders_BasicFXAA.uniforms});
		var done = false;
		var texture = THREE.ImageUtils.loadTexture("assets/test2.png",null,function(t) {
			done = true;
		});
		while(!done) {
		}
		texture.needsUpdate = true;
		var material = new THREE.MeshBasicMaterial({ map : texture});
		var plane = new THREE.Mesh(new THREE.PlaneGeometry(128,128),material);
		this.worldScene.add(plane);
		this.edtPass = new THREE.ShaderPass({ vertexShader : shaders_EDT.vertexShader, fragmentShader : shaders_EDT.fragmentShader, uniforms : shaders_EDT.uniforms});
		this.sdffDisplayPass = new THREE.ShaderPass({ vertexShader : shaders_SDFF_$AA.vertexShader, fragmentShader : shaders_SDFF_$AA.fragmentShader, uniforms : shaders_SDFF_$AA.uniforms});
		this.sdffDisplayPass.material.derivatives = true;
		this.sdffDisplayPass.renderToScreen = true;
		this.sdffDisplayPass.uniforms.texture.value = texture;
		this.sdffDisplayPass.uniforms.texw.value = texture.image.width;
		this.sdffDisplayPass.uniforms.texh.value = texture.image.height;
		this.composer = new THREE.EffectComposer(this.renderer);
		this.composer.addPass(this.sdffDisplayPass);
		this.edtComposer = new THREE.EffectComposer(this.renderer);
		this.edtComposer.addPass(this.edtPass);
		var renderTargetNearestFloatParams = { minFilter : THREE.NearestFilter, magFilter : THREE.NearestFilter, wrapS : THREE.ClampToEdgeWrapping, wrapT : THREE.ClampToEdgeWrapping, format : THREE.RGBAFormat, stencilBuffer : false, depthBuffer : false, type : THREE.FloatType};
		var stepSize;
		if(texture.image.width > texture.image.height) stepSize = texture.image.width / 2 | 0; else stepSize = texture.image.height / 2 | 0;
		var ping = new THREE.WebGLRenderTarget(texture.image.width,texture.image.height,renderTargetNearestFloatParams);
		var pong = new THREE.WebGLRenderTarget(texture.image.width,texture.image.height,renderTargetNearestFloatParams);
		var last = null;
		var stepIndex = 0;
		this.renderer.render(this.worldScene,this.worldCamera,ping);
		while(stepSize > 0) {
			this.edtPass.uniforms.texture.value = texture;
			this.edtPass.uniforms.texw.value = texture.image.width;
			this.edtPass.uniforms.texh.value = texture.image.height;
			this.edtPass.uniforms.step.value = stepSize;
			this.edtPass.uniforms.texlevels.value = 65536;
			this.edtComposer.renderTarget1 = ping;
			this.edtComposer.renderTarget2 = pong;
			this.edtComposer.render();
			last = pong;
			var tmp = ping;
			pong = ping;
			ping = tmp;
			stepSize = stepSize / 2 | 0;
			stepIndex++;
		}
		window.addEventListener("resize",function() {
			_g.signal_windowResized.dispatch();
		},true);
		window.addEventListener("contextmenu",function(event) {
			event.preventDefault();
		},true);
		window.addEventListener("keypress",function(event1) {
			var keycode = event1.keycode;
			event1.preventDefault();
		},true);
		this.setupGUI();
		this.signal_windowResized.add(function() {
			_g.worldCamera.aspect = window.innerWidth / window.innerHeight;
			_g.worldCamera.updateProjectionMatrix();
			_g.renderer.setSize(window.innerWidth,window.innerHeight);
		});
		this.signal_windowResized.add(function() {
			var pixelRatio = _g.renderer.getPixelRatio();
			var width1 = window.innerWidth * pixelRatio;
			var height1 = window.innerHeight * pixelRatio;
			_g.aaPass.uniforms.resolution.value.set(width1,height1);
			_g.composer.setSize(width1,height1);
		});
		this.signal_windowResized.dispatch();
		gameDiv.appendChild(this.renderer.domElement);
		window.requestAnimationFrame($bind(this,this.animate));
	}
	,animate: function(time) {
		Main.dt = (time - Main.lastAnimationTime) * 0.001;
		Main.lastAnimationTime = time;
		this.composer.render();
		window.requestAnimationFrame($bind(this,this.animate));
	}
	,setupGUI: function() {
		var actual = this.sceneGUI;
		var expected = null;
		if(actual != expected) throw new js__$Boot_HaxeError("FAIL: values are not equal (expected: " + Std.string(expected) + ", actual: " + Std.string(actual) + ")");
		this.sceneGUI = new dat.GUI({ autoPlace : true});
		dat_ThreeObjectGUI.addItem(this.sceneGUI,this.worldCamera,"World Camera");
		dat_ThreeObjectGUI.addItem(this.sceneGUI,this.worldScene,"Scene");
		var actual1 = this.shaderGUI;
		var expected1 = null;
		if(actual1 != expected1) throw new js__$Boot_HaxeError("FAIL: values are not equal (expected: " + Std.string(expected1) + ", actual: " + Std.string(actual1) + ")");
		this.shaderGUI = new dat.GUI({ autoPlace : true});
		dat_ShaderGUI.generate(this.shaderGUI,"Basic FXAA",this.aaPass.uniforms);
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
var Std = function() { };
Std.__name__ = true;
Std.string = function(s) {
	return js_Boot.__string_rec(s,"");
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
			folder.add(v,"value").listen().name(key);
			break;
		case "i":
			folder.add(v,"value").listen().name(key);
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
var shaders_BasicFXAA = function() { };
shaders_BasicFXAA.__name__ = true;
var shaders_EDT = function() { };
shaders_EDT.__name__ = true;
var shaders_SDFF_$RGB = function() { };
shaders_SDFF_$RGB.__name__ = true;
var shaders_SDFF_$AA = function() { };
shaders_SDFF_$AA.__name__ = true;
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
var Int = { __name__ : ["Int"]};
var Dynamic = { __name__ : ["Dynamic"]};
var Float = Number;
Float.__name__ = ["Float"];
var Bool = Boolean;
Bool.__ename__ = ["Bool"];
var Class = { __name__ : ["Class"]};
var Enum = { };
msignal_SlotList.NIL = new msignal_SlotList(null,null);
Main.REPO_URL = "https://github.com/Tw1ddle/Box";
Main.WEBSITE_URL = "http://samcodes.co.uk/";
Main.TWITTER_URL = "https://twitter.com/Sam_Twidale";
Main.HAXE_URL = "http://haxe.org/";
Main.lastAnimationTime = 0.0;
Main.dt = 0.0;
dat_ThreeObjectGUI.guiItemCount = 0;
js_Boot.__toStr = {}.toString;
shaders_BasicFXAA.uniforms = { tDiffuse : { type : "t", value : null}, resolution : { type : "v2", value : new THREE.Vector2(1024,1024)}};
shaders_BasicFXAA.vertexShader = "varying vec2 vUv;\r\n\r\nvoid main()\r\n{\r\n\tvUv = uv;\r\n\tgl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);\r\n}";
shaders_BasicFXAA.fragmentShader = "// Fast approximate anti-aliasing shader\r\n// Based on the three.js implementation: https://github.com/mrdoob/three.js/blob/master/examples/js/shaders/FXAAShader.js\r\n// Ported to three.js by alteredq: http://alteredqualia.com/ and davidedc: http://www.sketchpatch.net/\r\n// Ported to WebGL by @supereggbert: http://www.geeks3d.com/20110405/fxaa-fast-approximate-anti-aliasing-demo-glsl-opengl-test-radeon-geforce/\r\n// Originally implemented as NVIDIA FXAA by Timothy Lottes: http://timothylottes.blogspot.com/2011/06/fxaa3-source-released.html\r\n// Paper: http://developer.download.nvidia.com/assets/gamedev/files/sdk/11/FXAA_WhitePaper.pdf\r\n\r\n#define FXAA_REDUCE_MIN (1.0/128.0)\r\n#define FXAA_REDUCE_MUL (1.0/8.0)\r\n#define FXAA_SPAN_MAX 8.0\r\n\r\nvarying vec2 vUv;\r\n\r\nuniform sampler2D tDiffuse;\r\nuniform vec2 resolution;\r\n\r\nvoid main()\r\n{\r\n\tvec2 rres = vec2(1.0) / resolution;\r\n\t\r\n\t// Texture lookups to find RGB values in area of current fragment\r\n\tvec3 rgbNW = texture2D(tDiffuse, (gl_FragCoord.xy + vec2(-1.0, -1.0)) * rres).xyz;\r\n\tvec3 rgbNE = texture2D(tDiffuse, (gl_FragCoord.xy + vec2(1.0, -1.0)) * rres).xyz;\r\n\tvec3 rgbSW = texture2D(tDiffuse, (gl_FragCoord.xy + vec2(-1.0, 1.0)) * rres).xyz;\r\n\tvec3 rgbSE = texture2D(tDiffuse, (gl_FragCoord.xy + vec2(1.0, 1.0)) * rres).xyz;\r\n\tvec4 rgbaM = texture2D(tDiffuse, gl_FragCoord.xy  * rres);\r\n\tvec3 rgbM = rgbaM.xyz;\r\n\tfloat opacity = rgbaM.w;\r\n\t\r\n\t// Luminance estimates for colors around current fragment\r\n\tvec3 luma = vec3(0.299, 0.587, 0.114);\r\n\tfloat lumaNW = dot(rgbNW, luma);\r\n\tfloat lumaNE = dot(rgbNE, luma);\r\n\tfloat lumaSW = dot(rgbSW, luma);\r\n\tfloat lumaSE = dot(rgbSE, luma);\r\n\tfloat lumaM  = dot(rgbM, luma);\r\n\tfloat lumaMin = min(lumaM, min(min(lumaNW, lumaNE), min(lumaSW, lumaSE)));\r\n\tfloat lumaMax = max(lumaM, max(max(lumaNW, lumaNE), max(lumaSW, lumaSE)));\r\n\r\n\t// \r\n\tvec2 dir;\r\n\tdir.x = -((lumaNW + lumaNE) - (lumaSW + lumaSE));\r\n\tdir.y =  ((lumaNW + lumaSW) - (lumaNE + lumaSE));\r\n\r\n\tfloat dirReduce = max((lumaNW + lumaNE + lumaSW + lumaSE) * (0.25 * FXAA_REDUCE_MUL), FXAA_REDUCE_MIN);\r\n\r\n\tfloat rcpDirMin = 1.0 / (min(abs(dir.x), abs(dir.y)) + dirReduce);\r\n\tdir = min(vec2(FXAA_SPAN_MAX, FXAA_SPAN_MAX), max(vec2(-FXAA_SPAN_MAX, -FXAA_SPAN_MAX), dir * rcpDirMin)) * rres;\r\n\r\n\tvec3 rgbA = 0.5 * (texture2D(tDiffuse, gl_FragCoord.xy * rres + dir * (1.0 / 3.0 - 0.5 )).xyz + texture2D(tDiffuse, gl_FragCoord.xy * rres + dir * (2.0 / 3.0 - 0.5)).xyz);\r\n\tvec3 rgbB = rgbA * 0.5 + 0.25 * (texture2D(tDiffuse, gl_FragCoord.xy * rres + dir * -0.5).xyz + texture2D(tDiffuse, gl_FragCoord.xy * rres + dir * 0.5).xyz);\r\n\r\n\tfloat lumaB = dot(rgbB, luma);\r\n\t\r\n\tif ((lumaB < lumaMin) || (lumaB > lumaMax))\r\n\t{\r\n\t\tgl_FragColor = vec4(rgbA, opacity);\r\n\t}\r\n\telse\r\n\t{\r\n\t\tgl_FragColor = vec4(rgbB, opacity);\r\n\t}\r\n}";
shaders_EDT.uniforms = { 'texture' : { type : "t", value : null}, 'texw' : { type : "f", value : 0.0}, 'texh' : { type : "f", value : 0.0}, 'step' : { type : "f", value : 0.0}, 'texlevels' : { type : "f", value : 0.0}};
shaders_EDT.vertexShader = "// Jump flooding algorithm for Euclidean distance transform, according to Danielsson (1980) and Guodong Rong (2007).\r\n// Implementation by Stefan Gustavson 2010. Has added support for anti-aliased edges. This code is in the public domain.\r\n\r\n// This code represents one iteration of the flood filling.\r\n// You need to run it multiple times with different step lengths to perform a full distance transformation.\r\n\r\nvarying vec2 vUv;\r\nvarying float stepu;\r\nvarying float stepv;\r\n\r\nuniform float step;\r\nuniform float texw;\r\nuniform float texh;\r\n\r\nvoid main()\r\n{\r\n\t// Saves a division in the fragment shader\r\n\tstepu = step / texw;\r\n\tstepv = step / texh;\r\n\t\r\n\tvUv = uv;\t\r\n\tgl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);\r\n}";
shaders_EDT.fragmentShader = "// Jump flooding algorithm for Euclidean distance transform, according to Danielsson (1980) and Guodong Rong (2007).\r\n// Implementation by Stefan Gustavson 2010. Has added support for anti-aliased edges. This code is in the public domain.\r\n\r\n// This code represents one iteration of the flood filling.\r\n// You need to run it multiple times with different step lengths to perform a full distance transformation.\r\n\r\nvarying vec2 vUv;\r\nvarying float stepu;\r\nvarying float stepv;\r\n\r\nuniform sampler2D texture;\r\nuniform float texw;\r\nuniform float texh;\r\nuniform float texlevels;\r\n\r\n// Helper functions to remap unsigned normalized floats [0.0, 1.0] coming from an integer texture to the range we need [-1, 1].\r\n// The transformations are very specifically designed to map integer texel values exactly to pixel centers, and vice versa.\r\nvec2 remap(vec2 floatdata)\r\n{\r\n     return floatdata * (texlevels - 1.0) / texlevels * 2.0 - 1.0;\r\n}\r\n\r\nvec2 remap_inv(vec2 floatvec)\r\n{\r\n     return (floatvec + 1.0)* 0.5 * texlevels / (texlevels - 1.0);\r\n}\r\n\r\nvoid main()\r\n{\r\n\t// Search for better distance vectors among 8 candidates\r\n\tvec2 stepvec;  // Relative offset to candidate being tested\r\n\tvec2 newvec;   // Absolute position of that candidate\r\n\tvec4 newseed;  // Closest point from that candidate (.xy),\r\n\t\t\t\t // its AA distance (.z) and its grayscale value (.w)\r\n\tvec4 bestseed; // Closest seed so far\r\n\tvec3 texel;\r\n\ttexel = texture2D(texture, vUv).rgb;\r\n\tbestseed.xy = remap(texel.rg);\r\n\t\r\n\t// TODO: This AA assumes texw=texh. It does not allow for non-square textures.\r\n\tbestseed.z = length(bestseed.xy) + (texel.b - 0.5) / texw; // Add AA edge offset\r\n\tbestseed.w = texel.b; // Save AA edge offset\r\n\r\n\t// This code depends on the texture having a CLAMP_TO_BORDER attribute and a border color with R = 0.\r\n\t// The commented-out lines handle clamping to the edge explicitly to avoid propagating incorrect vectors when looking outside of [0,1] in u and/or v.\r\n\t// These explicit conditionals cause a slowdown of about 25%. Sometimes a periodic transform with edge repeats might be what you want. In that case, the texture wrap mode can be set to GL_REPEAT, and the shader code can be left unchanged.\r\n\r\n\tstepvec = vec2(-stepu, -stepv);\r\n\tnewvec = vUv + stepvec;\r\n\ttexel = texture2D(texture, newvec).rgb;\r\n\tnewseed.xy = remap(texel.rg);\r\n\tif(newseed.x > -0.99999)\r\n\t{\r\n\t  // If the new seed is not \"indeterminate distance\"\r\n\t  newseed.xy = newseed.xy + stepvec;\r\n\t  newseed.z = length(newseed.xy) + (texel.b - 0.5)/texw;\r\n\t  newseed.w = texel.b;\r\n\t  if(newseed.z < bestseed.z)\r\n\t  {\r\n\t\tbestseed = newseed;\r\n\t  }\r\n\t}\r\n\r\n\tstepvec = vec2(-stepu, 0.0);\r\n\tnewvec = vUv + stepvec;\r\n\ttexel = texture2D(texture, newvec).rgb;\r\n\tnewseed.xy = remap(texel.rg);\r\n\tif(newseed.x > -0.99999)\r\n\t{\r\n\t  // if the new seed is not \"indeterminate distance\"\r\n\t  newseed.xy = newseed.xy + stepvec;\r\n\t  newseed.z = length(newseed.xy) + (texel.b - 0.5)/texw;\r\n\t  newseed.w = texel.b;\r\n\t  if(newseed.z < bestseed.z)\r\n\t  {\r\n\t\tbestseed = newseed;\r\n\t  }\r\n\t}\r\n\r\n\tstepvec = vec2(-stepu, stepv);\r\n\tnewvec = vUv + stepvec;\r\n\ttexel = texture2D(texture, newvec).rgb;\r\n\tnewseed.xy = remap(texel.rg);\r\n\tif(newseed.x > -0.99999)\r\n\t{\r\n\t  // if the new seed is not \"indeterminate distance\"\r\n\t  newseed.xy = newseed.xy + stepvec;\r\n\t  newseed.z = length(newseed.xy) + (texel.b - 0.5)/texw;\r\n\t  newseed.w = texel.b;\r\n\t  if(newseed.z < bestseed.z)\r\n\t  {\r\n\t\tbestseed = newseed;\r\n\t  }\r\n\t}\r\n\r\n\tstepvec = vec2(0.0, -stepv);\r\n\tnewvec = vUv + stepvec;\r\n\ttexel = texture2D(texture, newvec).rgb;\r\n\tnewseed.xy = remap(texel.rg);\r\n\tif(newseed.x > -0.99999)\r\n\t{\r\n      // if the new seed is not \"indeterminate distance\"\r\n\t  newseed.xy = newseed.xy + stepvec;\r\n\t  newseed.z = length(newseed.xy) + (texel.b - 0.5)/texw;\r\n\t  newseed.w = texel.b;\r\n\t  if(newseed.z < bestseed.z)\r\n\t  {\r\n\t\tbestseed = newseed;\r\n\t  }\r\n\t}\r\n\r\n\tstepvec = vec2(0.0, stepv);\r\n\tnewvec = vUv + stepvec;\r\n\ttexel = texture2D(texture, newvec).rgb;\r\n\tnewseed.xy = remap(texel.rg);\r\n\tif(newseed.x > -0.99999)\r\n\t{\r\n\t  // if the new seed is not \"indeterminate distance\"\r\n\t  newseed.xy = newseed.xy + stepvec;\r\n\t  newseed.z = length(newseed.xy) + (texel.b - 0.5)/texw;\r\n\t  newseed.w = texel.b;\r\n\t  if(newseed.z < bestseed.z)\r\n\t  {\r\n\t\tbestseed = newseed;\r\n\t  }\r\n\t}\r\n\r\n\tstepvec = vec2(stepu, -stepv);\r\n\tnewvec = vUv + stepvec;\r\n\ttexel = texture2D(texture, newvec).rgb;\r\n\tnewseed.xy = remap(texel.rg);\r\n\tif(newseed.x > -0.99999)\r\n\t{\r\n\t  // if the new seed is not \"indeterminate distance\"\r\n\t  newseed.xy = newseed.xy + stepvec;\r\n\t  newseed.z = length(newseed.xy) + (texel.b - 0.5)/texw;\r\n\t  newseed.w = texel.b;\r\n\t  if(newseed.z < bestseed.z)\r\n\t  {\r\n\t\tbestseed = newseed;\r\n\t  }\r\n\t}\r\n\r\n\tstepvec = vec2(stepu, 0.0);\r\n\tnewvec = vUv + stepvec;\r\n\ttexel = texture2D(texture, newvec).rgb;\r\n\tnewseed.xy = remap(texel.rg);\r\n\tif(newseed.x > -0.99999)\r\n\t{\r\n\t  // if the new seed is not \"indeterminate distance\"\r\n\t  newseed.xy = newseed.xy + stepvec;\r\n\t  newseed.z = length(newseed.xy) + (texel.b - 0.5)/texw;\r\n\t  newseed.w = texel.b;\r\n\t  if(newseed.z < bestseed.z)\r\n\t  {\r\n\t\tbestseed = newseed;\r\n\t  }\r\n\t}\r\n\r\n\tstepvec = vec2(stepu, stepv);\r\n\tnewvec = vUv + stepvec;\r\n\ttexel = texture2D(texture, newvec).rgb;\r\n\tnewseed.xy = remap(texel.rg);\r\n\tif(newseed.x > -0.99999)\r\n\t{\r\n\t  // if the new seed is not \"indeterminate distance\"\r\n\t  newseed.xy = newseed.xy + stepvec;\r\n\t  newseed.z = length(newseed.xy) + (texel.b - 0.5)/texw;\r\n\t  newseed.w = texel.b;\r\n\t  if(newseed.z < bestseed.z)\r\n\t  {\r\n\t\tbestseed = newseed;\r\n\t  }\r\n\t}\r\n\r\n\tgl_FragColor = vec4(remap_inv(bestseed.xy), bestseed.w, 1.0);\r\n}";
shaders_SDFF_$RGB.uniforms = { 'texture' : { type : "t", value : null}, 'texw' : { type : "f", value : 0.0}, 'texh' : { type : "f", value : 0.0}};
shaders_SDFF_$RGB.vertexShader = "varying vec2 vUv;\r\n\r\nvoid main()\r\n{\r\n\tvUv = uv;\r\n\tgl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);\r\n}";
shaders_SDFF_$RGB.fragmentShader = "// Displays the final distance field visualized as an RGB image.\r\n// This code is in the public domain.\r\n\r\nvarying vec2 vUv;\r\n\r\nuniform sampler2D texture;\r\nuniform float texw;\r\nuniform float texh;\r\nuniform float texlevels;\r\n\r\n// Helper functions to remap unsigned normalized floats [0.0, 1.0] coming from an integer texture to the range we need [-1, 1].\r\n// The transformations are very specifically designed to map integer texel values exactly to pixel centers, and vice versa.\r\nvec2 remap(vec2 floatdata)\r\n{\r\n\treturn floatdata * (texlevels - 1.0) / texlevels * 2.0 - 1.0;\r\n}\r\n\r\nvoid main()\r\n{\r\n\tvec3 texel;\r\n\ttexel = texture2D(texture, vUv).rgb;\r\n\tvec2 distvec = remap(texel.rg);\r\n\t\r\n\t//vec2 rainbow = 0.5 + 0.5 * (normalize(distvec));\r\n\t//gl_FragColor = vec4(rainbow, 1.0 - (length(distvec) + texel.b - 0.5) * 4.0, 1.0);\r\n\t\r\n\tfloat dist = length(distvec) + (texel.b - 0.5) / texw;\r\n\tgl_FragColor = vec4(vec2(mod(10.0 * dist, 1.0)), texel.b, 1.0);\r\n}";
shaders_SDFF_$AA.uniforms = { 'texture' : { type : "t", value : null}, 'texw' : { type : "f", value : 0.0}, 'texh' : { type : "f", value : 0.0}};
shaders_SDFF_$AA.vertexShader = "varying vec2 vUv;\r\n\r\nvoid main()\r\n{\r\n\tvUv = uv;\r\n\tgl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);\r\n}";
shaders_SDFF_$AA.fragmentShader = "// Displays the final distance field. A re-implementation of Greens method, using a single channel high precision distance map and explicit texel interpolation.\r\n// This code is in the public domain.\r\n\r\nvarying vec2 vUv; // Texture coords from vertex shader\r\n//varying float oneu; // 1.0 / texw from vertex shader\r\n//varying float onev; // 1.0 / texh from vertex shader\r\n\r\nuniform sampler2D texture; // Single-channel distance field\r\nuniform float texw; // Texture height (texels)\r\nuniform float texh; // Texture width (texels)\r\n\r\nvoid main()\r\n{\r\n\tvec2 uv = vUv * vec2(texw, texh); // Scale to texture rect coords\r\n\tvec2 uv00 = floor (uv - vec2(0.5)); // Lower left of lower left texel\r\n\tvec2 uvlerp = uv - uv00 - vec2(0.5); // Texel - local blends [0,1]\r\n\t\r\n\t// Perform explicit texture interpolation of distance value D.\r\n\t// If hardware interpolation is OK, use D = texture2D( disttex, st).\r\n\t// Center st00 on lower left texel and rescale to [0,1] for lookup\r\n\tvec2 st00 = (uv00 + vec2(0.5)) * vec2(1.0 / texw, 1.0 / texh);\r\n\t\r\n\t// Sample distance D from the centers of the four closest texels\r\n\tfloat D00 = texture2D(texture, st00).r;\r\n\tfloat D10 = texture2D(texture, st00 + vec2 (0.5 * 1.0 / texw, 0.0)).r;\r\n\tfloat D01 = texture2D(texture, st00 + vec2 (0.0, 0.5 * 1.0 / texh)).r;\r\n\tfloat D11 = texture2D(texture, st00 + vec2 (0.5 * 1.0 / texw, 0.5 * 1.0 / texh)).r;\r\n\tvec2 D00_10 = vec2(D00, D10);\r\n\tvec2 D01_11 = vec2(D01, D11);\r\n\tvec2 D0_1 = mix(D00_10, D01_11, uvlerp.y); // Interpolate along v\r\n\tfloat D = mix(D0_1.x, D0_1.y, uvlerp.x); // Interpolate along u\r\n\t\r\n\t// Perform anisotropic analytic antialiasing\r\n\tfloat aastep = 0.7 * length(vec2(dFdx(D), dFdy(D)));\r\n\t\r\n\t// Pattern is 1 where D > 0, 0 where D < 0, with proper AA around D = 0.\r\n\tfloat pattern = smoothstep(-aastep, aastep, D);\r\n\t\r\n\tgl_FragColor = vec4(vec3(pattern), 1.0);\r\n}";
Main.main();
})(typeof console != "undefined" ? console : {log:function(){}}, typeof window != "undefined" ? window : typeof global != "undefined" ? global : typeof self != "undefined" ? self : this);
