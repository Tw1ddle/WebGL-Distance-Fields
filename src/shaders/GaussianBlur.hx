package shaders;

import three.Vector2;
import util.FileReader;

class GaussianBlur {	
	public static var uniforms = {
		tDiffuse: { type: "t", value: null },
		direction: { type: "v2", value: new Vector2(0, 0) },
		resolution: { type: "v2", value: new Vector2(1024.0, 1024.0) }
	};
	public static var vertexShader = FileReader.readFile("shaders/passthrough.vertex");
	public static var fragmentShader = FileReader.readFile("shaders/gaussian_blur.fragment");
}