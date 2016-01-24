package sdf.shaders;

import util.FileReader;

class Copy {
	public static var uniforms = {
		tDiffuse: { type: "t", value: null },
	};
	public static var vertexShader = FileReader.readFile("sdf/shaders/passthrough.vertex");
	public static var fragmentShader = FileReader.readFile("sdf/shaders/copy.fragment");
}