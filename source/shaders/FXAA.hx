package shaders;

import three.Vector2;
import util.FileReader;

class FXAA {	
	public static var uniforms = {
		tDiffuse: { type: "t", value: null },
		resolution: { type: "v2", value: new Vector2(1024.0, 1024.0) }
	};
	public static var vertexShader = FileReader.readFile("source/shaders/fxaa.vertex");
	public static var fragmentShader = FileReader.readFile("source/shaders/fxaa.fragment");
}