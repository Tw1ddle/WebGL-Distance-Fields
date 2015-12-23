package;

import composer.ShaderPass;
import dat.GUI;
import dat.ThreeObjectGUI;
import js.Browser;
import msignal.Signal.Signal0;
import msignal.Signal.Signal1;
import shaders.Copy;
import shaders.DF.DF_DISPLAY_AA;
import shaders.EDT.EDT_FLOOD;
import shaders.EDT.EDT_SEED;
import stats.Stats;
import three.Color;
import three.ImageUtils;
import three.Mapping;
import three.Mesh;
import three.OrthographicCamera;
import three.PixelFormat;
import three.PlaneGeometry;
import three.postprocessing.EffectComposer;
import three.Scene;
import three.ShaderMaterial;
import three.Texture;
import three.TextureDataType;
import three.TextureFilter;
import three.WebGLRenderer;
import three.WebGLRenderTarget;
import three.WebGLRenderTargetOptions;
import three.Wrapping;
import webgl.Detector;

class Main {
	public static inline var REPO_URL:String = "https://github.com/Tw1ddle/Box";
	public static inline var WEBSITE_URL:String = "http://samcodes.co.uk/";
	public static inline var TWITTER_URL:String = "https://twitter.com/Sam_Twidale";
	public static inline var HAXE_URL:String = "http://haxe.org/";
	
	public var signal_windowResized(default, null) = new Signal0();	
	
	private var gameAttachPoint:Dynamic;
	
	private static inline var texLevels:Float = 256.0;
	public var edtCamera(default, null):OrthographicCamera;
	public var edtScene(default, null):Scene;
	private var renderer:WebGLRenderer;
	private var ping:WebGLRenderTarget;
	private var pong:WebGLRenderTarget;
	
	private var aaPass:ShaderPass;
	private var composer:EffectComposer;
	private var sdffDisplayMaterial:ShaderMaterial;
	
	private var lettersTyped:Array<String>;
	public var signal_letterTyped(default, null) = new Signal1<String>();
	
	private static var lastAnimationTime:Float = 0.0; // Last time from requestAnimationFrame
	private static var dt:Float = 0.0; // Frame delta time
	
	//private var map:ObjectMap<Dynamic> = new ObjectMap<Dynamic>();
	
	private var sceneGUI:GUI;
	private var shaderGUI:GUI;
	
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
		
		// Attach game div
		gameAttachPoint = Browser.document.getElementById("game");
		gameAttachPoint.appendChild(gameDiv);
		
		// Setup WebGL renderer
        renderer = new WebGLRenderer( { antialias: true } );
		renderer.context.getExtension('OES_standard_derivatives');
        renderer.sortObjects = false;
		renderer.autoClear = false;
		renderer.setClearColor(new Color(0x000000));
		renderer.setPixelRatio(Browser.window.devicePixelRatio);
		
		var width = Browser.window.innerWidth * renderer.getPixelRatio();
		var height = Browser.window.innerHeight * renderer.getPixelRatio();
		
		var texture = ImageUtils.loadTexture("assets/logo.png", Mapping.UVMapping, function(texture:Texture):Void {			
			//camera = new PerspectiveCamera(75, width / height, 20, 70000);
			edtCamera = new OrthographicCamera(-texture.image.width / 2, texture.image.width / 2, texture.image.height / 2, -texture.image.height / 2, -10000, 10000);
			
			// Initial renderer setup
			signal_windowResized.dispatch();
			
			edtScene = new Scene();
			
			// Material for creating the initial seed texture
			var seedMaterial = new ShaderMaterial({
				vertexShader: EDT_SEED.vertexShader,
				fragmentShader: EDT_SEED.fragmentShader,
				uniforms: EDT_SEED.uniforms,
				transparent: true
			});
			seedMaterial.uniforms.tDiffuse.value = texture;
			seedMaterial.uniforms.texLevels.value = texLevels;
			
			// Render targets, buffers for iterative EDT rendering
			var renderTargetParams:WebGLRenderTargetOptions = {
				minFilter: TextureFilter.NearestFilter,
				magFilter: TextureFilter.NearestFilter,
				wrapS: Wrapping.ClampToEdgeWrapping,
				wrapT: Wrapping.ClampToEdgeWrapping,
				format: cast PixelFormat.RGBAFormat,
				stencilBuffer: false,
				depthBuffer: false,
				type: TextureDataType.UnsignedByteType
			};
			ping = new WebGLRenderTarget(texture.image.width, texture.image.height, renderTargetParams);
			pong = new WebGLRenderTarget(texture.image.width, texture.image.height, renderTargetParams);
			
			var geometry = new PlaneGeometry(texture.image.width, texture.image.height);
			var mesh = new Mesh(geometry, seedMaterial);
			edtScene.add(mesh);
			
			// Render scene into texture
			renderer.render(edtScene, edtCamera, ping, true);
			
			// Render into scene for viewing
			renderer.render(edtScene, edtCamera);
			
			// Material for performing the EDT
			var floodMaterial = new ShaderMaterial({
				vertexShader: EDT_FLOOD.vertexShader,
				fragmentShader: EDT_FLOOD.fragmentShader,
				uniforms: EDT_FLOOD.uniforms
			});
			
			edtScene.overrideMaterial = floodMaterial;

			// Current implementation will (probably) fail for larger textures, need RGB16, two separate textures or some other trick to do higher resolutions 
			//Sure.sure(texture.image.width <= 128);
			//Sure.sure(texture.image.height <= 128);
			
			var stepSize:Int = texture.image.width > texture.image.height ? Std.int(texture.image.width / 2) : Std.int(texture.image.height / 2);
			var last = ping;	
			while (stepSize > 0) {				
				floodMaterial.uniforms.texLevels.value = texLevels;
				floodMaterial.uniforms.texw.value = texture.image.width;
				floodMaterial.uniforms.texh.value = texture.image.height;
				floodMaterial.uniforms.tDiffuse.value = last;
				floodMaterial.uniforms.step.value = stepSize;

				last == ping ? last = pong : last = ping;
				
				renderer.render(edtScene, edtCamera, last, true);
				
				stepSize = Std.int(stepSize / 2);
				
				var copyMaterial = new ShaderMaterial( {
					vertexShader: Copy.vertexShader,
					fragmentShader: Copy.fragmentShader,
					uniforms: Copy.uniforms
				});
				copyMaterial.uniforms.tDiffuse.value = last;
				
				var displayMaterial = new ShaderMaterial( {
					vertexShader: DF_DISPLAY_AA.vertexShader,
					fragmentShader: DF_DISPLAY_AA.fragmentShader,
					uniforms: DF_DISPLAY_AA.uniforms
				});
				displayMaterial.derivatives = true;
				displayMaterial.uniforms.tDiffuse.value = last;
				//displayMaterial.uniforms.texLevels.value = texLevels;
				displayMaterial.uniforms.texw.value = texture.image.width;
				displayMaterial.uniforms.texh.value = texture.image.height;
				
				edtScene.overrideMaterial = copyMaterial;
				renderer.render(edtScene, edtCamera);
				
				edtScene.overrideMaterial = floodMaterial;
			}
			
			var displayMaterial = new ShaderMaterial( {
				vertexShader: DF_DISPLAY_AA.vertexShader,
				fragmentShader: DF_DISPLAY_AA.fragmentShader,
				uniforms: DF_DISPLAY_AA.uniforms
			});
			displayMaterial.derivatives = true;
			displayMaterial.uniforms.tDiffuse.value = last;
			//displayMaterial.uniforms.texLevels.value = texLevels;
			displayMaterial.uniforms.texw.value = texture.image.width;
			displayMaterial.uniforms.texh.value = texture.image.height;
			
			var copyMaterial = new ShaderMaterial( {
				vertexShader: Copy.vertexShader,
				fragmentShader: Copy.fragmentShader,
				uniforms: Copy.uniforms
			});
			copyMaterial.uniforms.tDiffuse.value = last;
			
			edtScene.overrideMaterial = copyMaterial;
			renderer.render(edtScene, edtCamera);
			
			//sdffDisplayMaterial = new ShaderMaterial( { vertexShader: SDFF_RGB.vertexShader, fragmentShader: SDFF_RGB.fragmentShader, uniforms: SDFF_RGB.uniforms } );
			sdffDisplayMaterial = new ShaderMaterial( { vertexShader: DF_DISPLAY_AA.vertexShader, fragmentShader: DF_DISPLAY_AA.fragmentShader, uniforms: DF_DISPLAY_AA.uniforms } );
			sdffDisplayMaterial.derivatives = true;
			sdffDisplayMaterial.transparent = true;
			
			sdffDisplayMaterial.uniforms.tDiffuse.value = texture;
			sdffDisplayMaterial.uniforms.texw.value = texture.image.width;
			sdffDisplayMaterial.uniforms.texh.value = texture.image.height;
			//sdffDisplayMaterial.uniforms.texLevels.value = texLevels;
			
			edtScene.overrideMaterial = sdffDisplayMaterial;
			
			renderer.render(edtScene, edtCamera);
			
			// Test the SDF renderer displays a test PNG correctly
			
			/*
			var texture = ImageUtils.loadTexture("assets/displaytest2.png", Mapping.UVMapping, function(texture:Texture):Void {
				//sdffDisplayMaterial = new ShaderMaterial( { vertexShader: SDFF_RGB.vertexShader, fragmentShader: SDFF_RGB.fragmentShader, uniforms: SDFF_RGB.uniforms } );
				sdffDisplayMaterial = new ShaderMaterial( { vertexShader: DF_DISPLAY_AA.vertexShader, fragmentShader: DF_DISPLAY_AA.fragmentShader, uniforms: DF_DISPLAY_AA.uniforms } );
				sdffDisplayMaterial.derivatives = true;
				sdffDisplayMaterial.transparent = true;
				
				sdffDisplayMaterial.uniforms.tDiffuse.value = texture;
				sdffDisplayMaterial.uniforms.texw.value = texture.image.width;
				sdffDisplayMaterial.uniforms.texh.value = texture.image.height;
				//sdffDisplayMaterial.uniforms.texLevels.value = texLevels;
				
				edtScene.overrideMaterial = sdffDisplayMaterial;
				
				renderer.render(edtScene, edtCamera);
			});
			*/
			
			
			setupGUI();
		});
		
		//var plane = new Mesh(new PlaneGeometry(128, 128), sdffDisplayMaterial);
		//worldScene.add(plane);
		
		// Setup composers
		//composer = new EffectComposer(renderer);
		//composer.addPass(aaPass);
		
		// Event setup
		// Window resize event
		Browser.window.addEventListener("resize", function():Void {
			signal_windowResized.dispatch();
		}, true);
		
		// Disable context menu opening
		Browser.window.addEventListener("contextmenu", function(event) {
			event.preventDefault();
		}, true);
		
		Browser.window.addEventListener("keypress", function(event) {
			var keycode = event.keycode;
			
			event.preventDefault();
		}, true);
		
		#if debug
		// Setup performance stats
		setupStats();
		#end
		
		// Connect signals and slots
		signal_windowResized.add(function():Void {
			//camera.aspect = Browser.window.innerWidth / Browser.window.innerHeight;
			edtCamera.updateProjectionMatrix();
			renderer.setSize(1024, 1024);
		});
		
		signal_windowResized.add(function():Void {
			var pixelRatio = renderer.getPixelRatio();
			var width = Browser.window.innerWidth * pixelRatio;
			var height = Browser.window.innerHeight * pixelRatio;
			
			//aaPass.uniforms.resolution.value.set(width, height);
		});
		
		// Present game and start animation loop
		gameDiv.appendChild(renderer.domElement);
		Browser.window.requestAnimationFrame(animate);
	}
	
	private function animate(time:Float):Void {
		#if debug
		stats.begin();
		#end
		
		dt = (time - lastAnimationTime) * 0.001; // Seconds
		lastAnimationTime = time;
		
		Browser.window.requestAnimationFrame(animate);
		
		#if debug
		stats.end();
		#end
	}
	
	private inline function setupGUI():Void {
		Sure.sure(sceneGUI == null);
		sceneGUI = new GUI( { autoPlace:true } );
		ThreeObjectGUI.addItem(sceneGUI, edtCamera, "World Camera");
		ThreeObjectGUI.addItem(sceneGUI, edtScene, "Scene");
		
		Sure.sure(shaderGUI == null);
		shaderGUI = new GUI( { autoPlace:true } );
		//ShaderGUI.generate(shaderGUI, "Basic FXAA", aaPass.uniforms);
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