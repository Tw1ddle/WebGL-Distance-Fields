package sdf.generator;

import sdf.shaders.Copy;
import sdf.shaders.EDT.EDT_FLOOD;
import sdf.shaders.EDT.EDT_SEED;
import sdf.shaders.GaussianBlur;
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
	public var texLevels(default, null):Float;
	
	private var renderer:WebGLRenderer;
	private var scene(default, null):Scene;
	private var camera(default, null):OrthographicCamera;
	
	private var renderTargetParams:WebGLRenderTargetOptions;
	
	private var blurMaterial:ShaderMaterial; // Material for performing optional initial blur on the input texture
	private var seedMaterial:ShaderMaterial; // Material for creating the initial seed texture
	private var floodMaterial:ShaderMaterial; // Material for performing the EDT
	
	/*
	private var copyMaterial:ShaderMaterial; // Material for copying the finalized texture elsewhere
	*/
	
	public function new(renderer:WebGLRenderer) {		
		texLevels = 256.0;
		
		this.renderer = renderer;
		
		scene = new Scene();
		scene.add(new Mesh(new PlaneGeometry(1, 1)));
		
		camera = new OrthographicCamera(-0.5, 0.5, 0.5, -0.5, -1, 1);
		camera.updateProjectionMatrix();
		
		blurMaterial = new ShaderMaterial( {
			vertexShader: GaussianBlur.vertexShader,
			fragmentShader: GaussianBlur.fragmentShader,
			uniforms: GaussianBlur.uniforms
		});
		
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
		
		/*
		copyMaterial = new ShaderMaterial( {
			vertexShader: Copy.vertexShader,
			fragmentShader: Copy.fragmentShader,
			uniforms: Copy.uniforms
		});
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
	public function transformTexture(texture:Texture, blurInput:Bool = true):WebGLRenderTarget {
		#if debug
		var start = haxe.Timer.stamp();
		#end
		
		var width = texture.image.width;
		var height = texture.image.height;
		
		// Render targets, buffers for iterative EDT rendering
		var ping = new WebGLRenderTarget(width, height, renderTargetParams);
		var pong = new WebGLRenderTarget(width, height, renderTargetParams);
		
		if (blurInput) {
			// Perform small Gaussian blur on the input, reducing the wavey or blockiness or poorly AA'd input images at the cost of the accuracy of the original shape
			scene.overrideMaterial = blurMaterial;
			blurMaterial.uniforms.resolution.value.set(width, height);
			
			// Horizontal blur on original texture
			blurMaterial.uniforms.tDiffuse.value = texture;
			blurMaterial.uniforms.direction.value.set(1, 0);
			
			texture.minFilter = TextureFilter.LinearFilter;
			texture.magFilter = TextureFilter.LinearFilter;
			texture.wrapS = Wrapping.RepeatWrapping;
			texture.wrapT = Wrapping.RepeatWrapping;
			renderer.render(scene, camera, ping, true);
			texture.wrapS = Wrapping.ClampToEdgeWrapping;
			texture.wrapT = Wrapping.ClampToEdgeWrapping;
			texture.minFilter = TextureFilter.NearestFilter;
			texture.magFilter = TextureFilter.NearestFilter;
			
			// Vertical blur on first render buffer
			blurMaterial.uniforms.tDiffuse.value = ping;
			blurMaterial.uniforms.direction.value.set(0, 1);
			
			ping.minFilter = TextureFilter.LinearFilter;
			ping.magFilter = TextureFilter.LinearFilter;
			ping.wrapS = Wrapping.RepeatWrapping;
			ping.wrapT = Wrapping.RepeatWrapping;
			renderer.render(scene, camera, pong, true);
			ping.wrapS = Wrapping.ClampToEdgeWrapping;
			ping.wrapT = Wrapping.ClampToEdgeWrapping;
			ping.minFilter = TextureFilter.NearestFilter;
			ping.magFilter = TextureFilter.NearestFilter;
			
			/*
			// Test to display the blurred input texture
			scene.overrideMaterial = copyMaterial;
			copyMaterial.uniforms.tDiffuse.value = pong;
			renderer.render(scene, camera);
			*/
		}
		
		// Draw seed image to first render target
		scene.overrideMaterial = seedMaterial;
		if (blurInput) {
			seedMaterial.uniforms.tDiffuse.value = pong;
		} else {
			seedMaterial.uniforms.tDiffuse.value = texture;
		}
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
		
		scene.overrideMaterial = null;
		
		// Destroy the spare render target, retain the one with the result
		if (last != ping) {
			ping.dispose();
		}
		if (last != pong) {
			pong.dispose();
		}
		
		#if debug
		var duration = haxe.Timer.stamp() - start;
		trace("Transform duration: " + duration);
		#end
		
		return last;
	}
}