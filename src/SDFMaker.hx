package;

import msignal.Signal.Signal2;
import shaders.Copy;
import shaders.EDT.EDT_FLOOD;
import shaders.EDT.EDT_SEED;
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

class SDFMaker {
	private var renderer:WebGLRenderer;
	private var scene(default, null):Scene;
	private var camera(default, null):OrthographicCamera;
	public var texLevels(default, null):Float;
	
	private var renderTargetParams:WebGLRenderTargetOptions;
	private var ping:WebGLRenderTarget;
	private var pong:WebGLRenderTarget;
	
	private var seedMaterial:ShaderMaterial; // Material for creating the initial seed texture
	private var floodMaterial:ShaderMaterial; // Material for performing the EDT
	private var copyMaterial:ShaderMaterial; // Material for copying the finalized texture elsewhere
	
	public var signal_textureLoaded(default, null) = new Signal2<Dynamic, WebGLRenderTarget>();
	
	public function new(renderer:WebGLRenderer) {		
		texLevels = 256.0;
		
		this.renderer = renderer;
		
		scene = new Scene();
		scene.add(new Mesh(new PlaneGeometry(1, 1)));
		
		camera = new OrthographicCamera(-0.5, 0.5, 0.5, -0.5, -1, 1);
		camera.updateProjectionMatrix();
		
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
		//var start = haxe.Timer.stamp();
		
		var width = texture.image.width;
		var height = texture.image.height;
		
		// Render targets, buffers for iterative EDT rendering
		ping = new WebGLRenderTarget(width, height, renderTargetParams);
		pong = new WebGLRenderTarget(width, height, renderTargetParams);
		
		// Draw seed image to first render target
		scene.overrideMaterial = seedMaterial;
		seedMaterial.uniforms.tDiffuse.value = texture;
		seedMaterial.uniforms.texLevels.value = texLevels;
		renderer.render(scene, camera, ping, true);
		
		// Iteratively calculate the euclidean distance transform, ping-ponging results into the render targets
		scene.overrideMaterial = floodMaterial;
		floodMaterial.uniforms.texLevels.value = texLevels;
		floodMaterial.uniforms.texw.value = width;
		floodMaterial.uniforms.texh.value = height;
		var stepSize:Int = width > height ? Std.int(width / 2) : Std.int(height / 2);
		var last = ping;	
		while (stepSize > 0) {				
			floodMaterial.uniforms.tDiffuse.value = last;
			floodMaterial.uniforms.step.value = stepSize;
			
			last == ping ? last = pong : last = ping;
			
			renderer.render(scene, camera, last, true);
			
			stepSize = Std.int(stepSize / 2);
			
			/*
			// Test to display the work-in-progress texture as the jump flooding algorithm iterates
			scene.overrideMaterial = copyMaterial;
			copyMaterial.uniforms.tDiffuse.value = last;
			renderer.render(scene, camera);
			scene.overrideMaterial = floodMaterial;
			*/
		}
		
		/*
		// Test to display the final result using the direct copy shader
		scene.overrideMaterial = copyMaterial;
		copyMaterial.uniforms.tDiffuse.value = last;
		renderer.render(scene, camera);
		*/
		
		// Destroy the spare render target, retain the one with the result
		if (last != ping) {
			ping.dispose();
		}
		if (last != pong) {
			pong.dispose();
		}
		
		//var duration = haxe.Timer.stamp() - start;
		//trace("Transform duration: " + duration);
		
		scene.overrideMaterial = null;
		
		signal_textureLoaded.dispatch("TODO", last);
		return last;
	}
}