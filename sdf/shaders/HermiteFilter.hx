package sdf.shaders;

import three.Vector2;
import util.FileReader;

class HermiteFilter {	
	public static var uniforms = {
		tDiffuse: { type: "t", value: null },
		texw: { type: "f", value: 0.0 },
		texh: { type: "f", value: 0.0 }
	};
	public static var vertexShader = FileReader.readFile("shaders/passthrough.vertex");
	public static var fragmentShader = FileReader.readFile("shaders/bicubichermite.fragment");
}