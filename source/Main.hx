package;

import composer.RenderPass;
import composer.ShaderPass;
import dat.GUI;
import dat.ShaderGUI;
import dat.ThreeObjectGUI;
import haxe.ds.StringMap;
import haxe.Timer;
import js.Browser;
import js.html.CanvasElement;
import js.html.TextMetrics;
import motion.Actuate;
import sdf.generator.SDFMaker;
import sdf.shaders.GaussianBlur;
import shaders.EDT_DISPLAY_DEMO;
import shaders.FXAA;
import stats.Stats;
import three.Color;
import three.Mapping;
import three.PerspectiveCamera;
import three.PixelFormat;
import three.PlaneGeometry;
import three.postprocessing.EffectComposer;
import three.Scene;
import three.ShaderMaterial;
import three.Texture;
import three.TextureDataType;
import three.TextureFilter;
import three.UniformsUtils;
import three.WebGLRenderer;
import three.WebGLRenderTarget;
import three.WebGLRenderTargetOptions;
import three.Wrapping;
import webgl.Detector;

class Main {
	public static inline var REPO_URL:String = "https://github.com/Tw1ddle/WebGL-Distance-Fields";
	public static inline var WEBSITE_URL:String = "https://samcodes.co.uk/";
	public static inline var TWITTER_URL:String = "https://twitter.com/Sam_Twidale";
	public static inline var HAXE_URL:String = "http://haxe.org/";
	
	private var loaded:Bool = false;
	
	private var renderer:WebGLRenderer;
	private var composer:EffectComposer;
	private var aaPass:ShaderPass;
	
	private var scene:Scene;
	private var camera:PerspectiveCamera;
	
	private var blurMaterial:ShaderMaterial; // Material for blurring canvas textures slightly, reduces issues related to bad or weird AA at the cost of sharp corners
	private var blurRenderTargetParams:WebGLRenderTargetOptions;
	
	private var sdfMaker:SDFMaker;
	private var sdfMap:StringMap<WebGLRenderTarget> = new StringMap<WebGLRenderTarget>(); // Map of string input -> SDF texture
	private var characterMap:StringMap<Character> = new StringMap<Character>(); // Map of string input -> character meshes with SDF rendering material
	private var characters:Array<Character> = new Array<Character>(); // In-order array of the line of characters shown in the scene
	
	private static var lastAnimationTime:Float = 0.0; // Last time from requestAnimationFrame
	private static var dt:Float = 0.0; // Frame delta time
	
	#if debug
	private var sceneGUI:GUI = new GUI( { autoPlace:true } );
	//private var shaderGUI:GUI = new GUI( { autoPlace:true } );
	private var stats(default, null):Stats;
	#end
	
    private static function main():Void {
		var main = new Main();
	}
	
	private inline function new() {
		Browser.window.onload = onWindowLoaded;
	}
	
	private inline function onWindowLoaded():Void {
		var gameDiv = Browser.document.createElement("attach");
		
		// WebGL support check
		var glSupported:WebGLSupport = Detector.detect();
		if (glSupported != SUPPORTED_AND_ENABLED) {
			var unsupportedInfo = Browser.document.createElement('div');
			unsupportedInfo.style.position = 'absolute';
			unsupportedInfo.style.top = '10px';
			unsupportedInfo.style.width = '100%';
			unsupportedInfo.style.textAlign = 'center';
			unsupportedInfo.style.color = '#ffffff';
			
			switch(glSupported) {
				case WebGLSupport.NOT_SUPPORTED:
					unsupportedInfo.innerHTML = 'Your browser does not support WebGL. Click <a href="' + REPO_URL + '" target="_blank">here for project info</a> instead.';
				case WebGLSupport.SUPPORTED_BUT_DISABLED:
					unsupportedInfo.innerHTML = 'Your browser supports WebGL, but the feature appears to be disabled. Click <a href="' + REPO_URL + '" target="_blank">here for project info</a> instead.';
				default:
					unsupportedInfo.innerHTML = 'Could not detect WebGL support. Click <a href="' + REPO_URL + '" target="_blank">here for project info</a> instead.';
			}
			
			gameDiv.appendChild(unsupportedInfo);
			return;
		}
		
		// Setup WebGL renderer
        renderer = new WebGLRenderer( { antialias: true } );
		
		// WebGL extensions support check
		var extDerivatives = 'OES_standard_derivatives';
		var ext = renderer.context.getExtension(extDerivatives);
		if (ext == null) {
			var missingExtensionInfo = Browser.document.createElement('div');
			missingExtensionInfo.style.position = 'absolute';
			missingExtensionInfo.style.top = '10px';
			missingExtensionInfo.style.width = '100%';
			missingExtensionInfo.style.textAlign = 'center';
			missingExtensionInfo.style.color = '#ffffff';
			missingExtensionInfo.innerHTML = 'Missing required WebGL extension: ' + extDerivatives + ' Click <a href="' + REPO_URL + '" target="_blank">here for project info</a> instead.';
			gameDiv.appendChild(missingExtensionInfo);
			return;
		}
		
        renderer.sortObjects = false;
		renderer.autoClear = false;
		renderer.setClearColor(new Color(0x000000));
		renderer.setPixelRatio(Browser.window.devicePixelRatio);
		
		// Attach game div
		var gameAttachPoint = Browser.document.getElementById("game");
		gameAttachPoint.appendChild(gameDiv);
		
		// Add credits
		var container = Browser.document.createElement('div');
		Browser.document.body.appendChild(container);
		var info = Browser.document.createElement('div');
		info.style.position = 'absolute';
		info.style.top = '20px';
		info.style.width = '100%';
		info.style.textAlign = 'center';
		info.style.color = 'white';
		info.innerHTML = '<a href="https://github.com/Tw1ddle/WebGL-Distance-Fields" target="_blank">Distance fields</a> by <a href="http://www.samcodes.co.uk/" target="_blank">Sam Twidale</a>. Technique by <a href="http://contourtextures.wikidot.com/" target="_blank">Stefan Gustavson</a>.';
		container.appendChild(info);
		
		var width = Browser.window.innerWidth * renderer.getPixelRatio();
		var height = Browser.window.innerHeight * renderer.getPixelRatio();
		
		scene = new Scene();
		camera = new PerspectiveCamera(75, width / height, 1.0, 8000.0);
		camera.position.z = 150;
		
		// Setup composer passes
		composer = new EffectComposer(renderer);
		
		var renderPass = new RenderPass(scene, camera);
		
		aaPass = new ShaderPass( { vertexShader: FXAA.vertexShader, fragmentShader: FXAA.fragmentShader, uniforms: FXAA.uniforms } );
		aaPass.renderToScreen = true;
		aaPass.uniforms.resolution.value.set(width, height);
		
		composer.addPass(renderPass);
		composer.addPass(aaPass);
		
		// Initial renderer setup
		onResize();
		
		sdfMaker = new SDFMaker(renderer);
		
		blurMaterial = new ShaderMaterial( {
			vertexShader: GaussianBlur.vertexShader,
			fragmentShader: GaussianBlur.fragmentShader,
			uniforms: GaussianBlur.uniforms
		});
		
		blurRenderTargetParams = {
			minFilter: TextureFilter.LinearFilter,
			magFilter: TextureFilter.LinearFilter,
			wrapS: Wrapping.RepeatWrapping,
			wrapT: Wrapping.RepeatWrapping,
			format: cast PixelFormat.RGBAFormat,
			stencilBuffer: false,
			depthBuffer: false,
			type: TextureDataType.UnsignedByteType
		};
		
		// Event setup
		// Window resize event
		Browser.window.addEventListener("resize", function():Void {
			onResize();
		}, true);
		
		// Disable context menu opening
		Browser.window.addEventListener("contextmenu", function(event) {
			event.preventDefault();
		}, true);
		
		// Add characters on keypress
		Browser.window.addEventListener("keypress", function(event) {
			if (!loaded) {
				event.preventDefault();
				return;
			}
			
			var keycode = event.which == null ? event.keyCode : event.which;
			
			if (keycode <= 0) {
				event.preventDefault();
				return;
			}
			
			var ch = String.fromCharCode(keycode);
			
			if(ch.length > 0 && keycode != 8) {
				generateDistanceFieldForString(ch);
				addCharacter(characterMap.get(ch).create());
			}
			
			event.preventDefault();
		}, true);
		
		// Remove characters on delete/backspace
		Browser.window.addEventListener("keydown", function(event) {
			if (!loaded) {
				event.preventDefault();
				return;
			}
			
			var keycode = event.which == null ? event.keyCode : event.which;
			
			if (keycode == 8 || keycode == 46) {
				removeCharacter();
				event.preventDefault();
			}
		}, true);
		
		var onMouseWheel = function(event:Dynamic) {
			if (!loaded) {
				event.preventDefault();
				return;
			}
			
			var delta = event.wheelDelta == null ? event.detail : event.wheelDelta;

			if (delta > 0) {
				camera.position.z -= 20;
			} else if (delta < 0) {
				camera.position.z += 20;
			}
			
			event.preventDefault();
		}
		
		// Zoom in or out manually
		Browser.document.addEventListener("mousewheel", onMouseWheel, false);
		Browser.document.addEventListener("DOMMouseScroll", onMouseWheel, false);
		
		#if debug
		// Setup performance stats
		setupStats();
		
		// Onscreen debug controls
		setupGUI();
		#end
		
		// Add some instructional text
		generateDelayedString("TYPE SOMETHING! ", 300);
		
		// Present game and start animation loop
		loaded = true;
		gameDiv.appendChild(renderer.domElement);
		Browser.window.requestAnimationFrame(animate);
	}
	
	private inline function generateDelayedString(message:String, msPerLetter:Int):Void {
		var t = msPerLetter;
		for (i in 0...message.length) {
			Timer.delay(function() {
				generateDistanceFieldForString(message.charAt(i));
				addCharacter(characterMap.get(message.charAt(i)).create());
			}, t);
			t += msPerLetter;
		}
	}
	
	// Called when browser window resizes
	private function onResize():Void {
		var width = Browser.window.innerWidth * renderer.getPixelRatio();
		var height = Browser.window.innerHeight * renderer.getPixelRatio();
		
		renderer.setSize(Browser.window.innerWidth, Browser.window.innerHeight);
		
		composer.setSize(width, height);
		aaPass.uniforms.resolution.value.set(width, height);
		
		camera.aspect = width / height;
		camera.updateProjectionMatrix();
	}
	
	private function generateDistanceFieldForString(s:String):Void {
		// Don't generate for the same string input more than once
		if (!characterMap.exists(s)) {
			var data: { canvas: CanvasElement, metrics:TextMetrics } = InputGenerator.generateText(s);
			generateDistanceField(data.canvas, data.metrics, s);
		}
	}
	
	// Create a distance field texture for the given canvas element
	private inline function generateDistanceField(element:CanvasElement, metrics:TextMetrics, id:String, blurInput:Bool = true):Void {
		var texture = new Texture(element, Mapping.UVMapping);
		texture.needsUpdate = true;
		var width:Int = texture.image.width;
		var height:Int = texture.image.height;
		
		var target = sdfMap.get(id);
		if (target == null) {
			target = sdfMaker.transformTexture(texture, blurInput);
			sdfMap.set(id, target);
        }
		
		var geometry = new PlaneGeometry(width, height);
		
		var demoMaterial = new ShaderMaterial({
			vertexShader: EDT_DISPLAY_DEMO.vertexShader,
			fragmentShader: EDT_DISPLAY_DEMO.fragmentShader,
			uniforms: UniformsUtils.clone(EDT_DISPLAY_DEMO.uniforms)
		});
		demoMaterial.transparent = true;
		demoMaterial.derivatives = true;
		demoMaterial.uniforms.tDiffuse.value = target;
		demoMaterial.uniforms.texw.value = width;
		demoMaterial.uniforms.texh.value = height;
		demoMaterial.uniforms.texLevels.value = sdfMaker.texLevels;
		demoMaterial.uniforms.threshold.value = 0.0;
		demoMaterial.uniforms.alpha.value = 1.0;
		demoMaterial.uniforms.color.value.set(Math.random() * 0.04, Math.random() * 0.2, 0.5 + Math.random() * 0.5);
		
		characterMap.set(id, new Character(geometry, demoMaterial, target.width, target.height, metrics));
	}
	
	// Add a character to the end of the array
	private inline function addCharacter(character:Character):Void {
		Sure.sure(character != null);
		
		scene.add(character);
		
		var spawn = character.spawnPosition;
		var target = character.targetPosition;
		
		if (characters.length > 0) {
			var lastTarget = characters[characters.length - 1].targetPosition;
			target.set(lastTarget.x + character.metrics.width, lastTarget.y, lastTarget.z + 1.0);
		} else {
			target.set(0, 0, 0);
		}
		
		spawn.set(target.x + 50 + Math.random() * 300, target.y + Math.random() * 300 - 150, target.z);
		character.position.set(spawn.x, spawn.y, spawn.z);
		character.scale.set(0, 0, 1);
		
		characters.push(character);
		
		Actuate.tween(character.scale, 1, { x: 1.0, y: 1.0 } );
		Actuate.tween(character.position, 1, { x: target.x, y: target.y, z: target.z } );
		Actuate.tween(camera.position, 1, { x: target.x, y: target.y, z: Math.min(1000, camera.position.z + 25) } );
	}
	
	// Remove the last character from the array
	private inline function removeCharacter():Void {
		if (characters.length == 0) {
			return;
		}
		
		var character = characters.pop();
		
		Sure.sure(character != null);
		
		Actuate.tween(character.scale, 1, { x: 0.0, y: 0.0 } );
		
		if (characters.length > 0) {
			var last = characters[characters.length - 1].position;
			Actuate.tween(camera.position, 1, { x: last.x, y: last.y, z: Math.max(150, camera.position.z - 25) } );
		}
		
		Actuate.tween(character.position, 1, { x: character.spawnPosition.x, y: character.spawnPosition.y } ).onComplete(function() {
			scene.remove(character);
		});
	}
	
	private function animate(time:Float):Void {
		#if debug
		stats.begin();
		#end
		
		dt = (time - lastAnimationTime) * 0.001; // Seconds
		lastAnimationTime = time;
		
		composer.render(dt);
		
		Browser.window.requestAnimationFrame(animate);
		
		#if debug
		stats.end();
		#end
	}
	
	#if debug
	private inline function setupGUI():Void {
		ThreeObjectGUI.addItem(sceneGUI, camera, "World Camera");
		ThreeObjectGUI.addItem(sceneGUI, scene, "Scene");
		
		//ShaderGUI.generate(shaderGUI, "FXAA", aaPass.uniforms);
	}
	
	private inline function setupStats(mode:Mode = Mode.MEM):Void {
		Sure.sure(stats == null);
		stats = new Stats();
		stats.domElement.style.position = 'absolute';
		stats.domElement.style.left = '0px';
		stats.domElement.style.top = '0px';
		Browser.window.document.body.appendChild(stats.domElement);
	}
	#end
}