package;

import shaders.Copy;
import shaders.EDT.EDT_DISPLAY_AA;
import shaders.EDT.EDT_FLOOD;
import shaders.EDT.EDT_SEED;
import three.ImageUtils;
import three.Mapping;
import three.Mesh;
import three.OrthographicCamera;
import three.PixelFormat;
import three.PlaneGeometry;
import three.Scene;
import three.ShaderMaterial;
import three.Texture;
import three.TextureDataType;
import three.TextureFilter;
import three.WebGLRenderer;
import three.WebGLRenderTarget;
import three.WebGLRenderTargetOptions;
import three.Wrapping;
import haxe.Timer;

import msignal.Signal.Signal2;

class SDFMaker {
	private var renderer:WebGLRenderer;
	private var texLevels:Float;
	private var edtScene(default, null):Scene;
	private var edtCamera(default, null):OrthographicCamera;
	
	private var renderTargetParams:WebGLRenderTargetOptions;
	private var ping:WebGLRenderTarget;
	private var pong:WebGLRenderTarget;
	
	private var seedMaterial:ShaderMaterial; // Material for creating the initial seed texture
	private var floodMaterial:ShaderMaterial; // Material for performing the EDT
	private var copyMaterial:ShaderMaterial; // Material for copying the finalized texture elsewhere
	//private var sdffDisplayMaterial:ShaderMaterial; // Test material for rendering the EDT'd texture
	
	public var signal_textureLoaded(default, null) = new Signal2<Dynamic, WebGLRenderTarget>();
	
	public function new(renderer:WebGLRenderer) {
		this.renderer = renderer;
		
		texLevels = 256.0;
		
		edtScene = new Scene();
		edtScene.add(new Mesh(new PlaneGeometry(1, 1)));
		
		edtCamera = new OrthographicCamera(-0.5, 0.5, 0.5, -0.5, -1, 1);
		edtCamera.updateProjectionMatrix();
		
		seedMaterial = new ShaderMaterial({
			vertexShader: EDT_SEED.vertexShader,
			fragmentShader: EDT_SEED.fragmentShader,
			uniforms: EDT_SEED.uniforms,
			transparent: true
		});
		
		floodMaterial = new ShaderMaterial({
			vertexShader: EDT_FLOOD.vertexShader,
			fragmentShader: EDT_FLOOD.fragmentShader,
			uniforms: EDT_FLOOD.uniforms
		});
		
		copyMaterial = new ShaderMaterial( {
			vertexShader: Copy.vertexShader,
			fragmentShader: Copy.fragmentShader,
			uniforms: Copy.uniforms
		});
		
		/*
		sdffDisplayMaterial = new ShaderMaterial( { 
			vertexShader: EDT_DISPLAY_AA.vertexShader,
			fragmentShader: EDT_DISPLAY_AA.fragmentShader,
			uniforms: EDT_DISPLAY_AA.uniforms 
		});
		sdffDisplayMaterial.derivatives = true;
		*/
		
		renderTargetParams = {
			minFilter: TextureFilter.NearestFilter,
			magFilter: TextureFilter.NearestFilter,
			wrapS: Wrapping.ClampToEdgeWrapping,
			wrapT: Wrapping.ClampToEdgeWrapping,
			format: cast PixelFormat.RGBAFormat,
			stencilBuffer: false,
			depthBuffer: false,
			type: TextureDataType.UnsignedByteType
		};
	}
	
	// Performs EDT on the texture, returning a render target with the result
	public function transformTexture(texture:Texture):WebGLRenderTarget {
		/*
		// Profiling
		var start = haxe.Timer.stamp();
		*/
		
		seedMaterial.uniforms.tDiffuse.value = texture;
		seedMaterial.uniforms.texLevels.value = texLevels;
		
		// Render targets, buffers for iterative EDT rendering
		ping = new WebGLRenderTarget(texture.image.width, texture.image.height, renderTargetParams);
		pong = new WebGLRenderTarget(texture.image.width, texture.image.height, renderTargetParams);
		
		// Draw seed image to first render target
		edtScene.overrideMaterial = seedMaterial;
		renderer.render(edtScene, edtCamera, ping, true);
		
		/*
		// Test render the seed texture for viewing
		renderer.render(edtScene, edtCamera);
		*/
		
		// Iteratively calculate the euclidean distance transform, ping-ponging results into the render targets
		edtScene.overrideMaterial = floodMaterial;
		floodMaterial.uniforms.texLevels.value = texLevels;
		floodMaterial.uniforms.texw.value = texture.image.width;
		floodMaterial.uniforms.texh.value = texture.image.height;
		var stepSize:Int = texture.image.width > texture.image.height ? Std.int(texture.image.width / 2) : Std.int(texture.image.height / 2);
		var last = ping;	
		while (stepSize > 0) {				
			floodMaterial.uniforms.tDiffuse.value = last;
			floodMaterial.uniforms.step.value = stepSize;
			
			last == ping ? last = pong : last = ping;
			
			renderer.render(edtScene, edtCamera, last, true);
			
			stepSize = Std.int(stepSize / 2);
			
			/*
			// Test to display the work-in-progress texture as the jump flooding algorithm iterates
			edtScene.overrideMaterial = copyMaterial;
			renderer.render(edtScene, edtCamera);
			edtScene.overrideMaterial = floodMaterial;
			*/
		}
		
		/*
		// Test to display the final result using the direct copy shader
		edtScene.overrideMaterial = copyMaterial;
		copyMaterial.uniforms.tDiffuse.value = last;
		renderer.render(edtScene, edtCamera);
		*/
		
		/*
		// Test to display the final result using the display shader
		sdffDisplayMaterial.uniforms.tDiffuse.value = texture;
		//sdffDisplayMaterial.uniforms.texLevels.value = texLevels;
		sdffDisplayMaterial.uniforms.texw.value = texture.image.width;
		sdffDisplayMaterial.uniforms.texh.value = texture.image.height;
		edtScene.overrideMaterial = sdffDisplayMaterial;
		renderer.render(edtScene, edtCamera);
		*/
		
		// Destroy the spare render target, retain the one with the result
		if (last != ping) {
			ping.dispose();
		}
		if (last != pong) {
			pong.dispose();
		}
		
		/*
		// End profiling
		var duration = haxe.Timer.stamp() - start;
		trace("TRANSFORM DURATION: " + duration);
		*/
		
		signal_textureLoaded.dispatch(texture.uuid, last);
		return last;
	}
}