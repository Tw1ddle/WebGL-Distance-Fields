package;

import dat.GUI;
import dat.ThreeObjectGUI;
import haxe.ds.StringMap;
import js.Browser;
import js.html.CanvasElement;
import js.html.TextMetrics;
import motion.Actuate;
import sdf.generator.SDFMaker;
import sdf.shaders.EDT.EDT_DISPLAY_AA;
import stats.Stats;
import three.Color;
import three.Mapping;
import three.PerspectiveCamera;
import three.PlaneGeometry;
import three.postprocessing.EffectComposer;
import three.Scene;
import three.ShaderMaterial;
import three.Texture;
import three.UniformsUtils;
import three.WebGLRenderer;
import webgl.Detector;
import composer.ShaderPass;
import shaders.FXAA;
import three.WebGLRenderTarget;
import three.TextureFilter;
import composer.RenderPass;
import three.Vector3;
import dat.ShaderGUI;

@:native("THREE.TrackballControls")
extern class TrackballControls {
	public function new(object:Dynamic, ?domElement:Dynamic);
	
	public function handleResize():Void;
	public function update():Void;
	
	public var enabled:Bool;
	public var rotateSpeed:Float;
	public var zoomSpeed:Float;
	public var panSpeed:Float;
	public var noZoom:Bool;
	public var noPan:Bool;
	public var staticMoving:Bool;
	public var dynamicDampingFactor:Float;
	public var keys:Dynamic;
	public var target:Vector3;
}

class Main {
	public static inline var REPO_URL:String = "https://github.com/Tw1ddle/WebGL-Distance-Fields";
	public static inline var WEBSITE_URL:String = "http://samcodes.co.uk/";
	public static inline var TWITTER_URL:String = "https://twitter.com/Sam_Twidale";
	public static inline var HAXE_URL:String = "http://haxe.org/";
	
	private var gameAttachPoint:Dynamic;
	
	private var renderer:WebGLRenderer;
	private var composer:EffectComposer;
	private var renderPass:RenderPass;
	private var aaPass:ShaderPass;
	
	private var scene:Scene;
	private var camera:PerspectiveCamera;
	
	private var sdfMaker:SDFMaker;
	private var characterMap:StringMap<Character> = new StringMap<Character>();
	private var characters:Array<Character> = new Array<Character>();
	
	private static var lastAnimationTime:Float = 0.0; // Last time from requestAnimationFrame
	private static var dt:Float = 0.0; // Frame delta time
	
	private var sceneGUI:GUI = new GUI( { autoPlace:true } );
	private var shaderGUI:GUI = new GUI( { autoPlace:true } );
	
	#if debug
	public var stats(default, null):Stats;
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
		gameAttachPoint = Browser.document.getElementById("game");
		gameAttachPoint.appendChild(gameDiv);
		
		var width = Browser.window.innerWidth * renderer.getPixelRatio();
		var height = Browser.window.innerHeight * renderer.getPixelRatio();
		
		scene = new Scene();
		camera = new PerspectiveCamera(75, width / height, 1.0, 8000.0);
		camera.position.z = 100;
		
		// Setup composer passes
		composer = new EffectComposer(renderer);
		
		renderPass = new RenderPass(scene, camera);
		
		aaPass = new ShaderPass( { vertexShader: FXAA.vertexShader, fragmentShader: FXAA.fragmentShader, uniforms: FXAA.uniforms } );
		aaPass.renderToScreen = true;
		aaPass.uniforms.resolution.value.set(width, height);
		
		composer.addPass(renderPass);
		composer.addPass(aaPass);
		
		// Initial renderer setup
		onResize();
		
		sdfMaker = new SDFMaker(renderer);
		
		// Event setup
		// Window resize event
		Browser.window.addEventListener("resize", function():Void {
			onResize();
		}, true);
		
		// Disable context menu opening
		Browser.window.addEventListener("contextmenu", function(event) {
			event.preventDefault();
		}, true);
		
		Browser.window.addEventListener("keydown", function(event) {
			var keycode = event.keyCode == null ? event.charCode : event.keyCode;
			
			if (keycode == 8 || keycode == 46) {
				removeCharacter();
			}
		}, true);
		
		Browser.window.addEventListener("keypress", function(event) {
			var keycode = event.keyCode == null ? event.charCode : event.keyCode;
			
			if (keycode == 8 || keycode == 46) {
				return;
			}
			
			var ch = String.fromCharCode(keycode);
			
			if(ch.length > 0) {
				generateDistanceFieldForString(ch);
				addCharacter(characterMap.get(ch).create());
			}
			
			event.preventDefault();
		}, true);
		
		#if debug
		// Setup performance stats
		setupStats();
		#end
		
		setupGUI();
		
		// Present game and start animation loop
		gameDiv.appendChild(renderer.domElement);
		Browser.window.requestAnimationFrame(animate);
	}
	
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
			var data:{canvas: CanvasElement, metrics:TextMetrics } = InputGenerator.generateText(s);
			generateDistanceField(data.canvas, data.metrics, s);
		}
	}
	
	private inline function generateDistanceField(element:CanvasElement, metrics:TextMetrics, id:String):Void {
		var texture = new Texture(element, Mapping.UVMapping);
		texture.needsUpdate = true;
		var target = sdfMaker.transformTexture(texture, true);
		
		var geometry = new PlaneGeometry(target.width, target.height);
		
		var aaMaterial = new ShaderMaterial({
			vertexShader: EDT_DISPLAY_AA.vertexShader,
			fragmentShader: EDT_DISPLAY_AA.fragmentShader,
			uniforms: UniformsUtils.clone(EDT_DISPLAY_AA.uniforms)
		});
		aaMaterial.transparent = true;
		aaMaterial.derivatives = true;
		aaMaterial.uniforms.tDiffuse.value = target;
		aaMaterial.uniforms.texw.value = target.width;
		aaMaterial.uniforms.texh.value = target.height;
		aaMaterial.uniforms.texLevels.value = sdfMaker.texLevels;
		aaMaterial.uniforms.threshold.value = 0.0;
		
		characterMap.set(id, new Character(geometry, aaMaterial, target.width, target.height, metrics));
	}
	
	private inline function addCharacter(character:Character):Void {
		scene.add(character);
		
		// TODO tween in
		if (characters.length > 0) {
			var last = characters[characters.length - 1].position;
			character.position.set(last.x, last.y, last.z + 1.0);
			character.position.x += character.metrics.width;
		} else {
			character.position.set(0, 0, 0);
		}
		
		characters.push(character);
		Actuate.tween(camera.position, 1, { x: character.position.x, y: character.position.y, z: camera.position.z + 25 } );
	}
	
	private function removeCharacter():Void {
		if (characters.length == 0) {
			return;
		}
		
		var ch = characters.pop();
		
		Sure.sure(ch != null);
		
		if (characters.length > 0) {
			var last = characters[characters.length - 1].position;
			Actuate.tween(camera.position, 1, { x: last.x, y: last.y, z: camera.position.z - 25 } );
		}
		
		// TODO tween out
		scene.remove(ch);
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
	
	private function setupGUI():Void {
		ThreeObjectGUI.addItem(sceneGUI, camera, "World Camera");
		ThreeObjectGUI.addItem(sceneGUI, scene, "Scene");
		
		ShaderGUI.generate(shaderGUI, "FXAA", aaPass.uniforms);
	}
	
	#if debug
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