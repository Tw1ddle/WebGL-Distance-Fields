package shaders;

import util.FileReader;

import three.Vector3;

// Modified EDT_DISPLAY_AA shader with some basic demo effects, fade-in, fade-out etc
class EDT_DISPLAY_DEMO {
	public static var uniforms = {
		tDiffuse: { type: "t", value: null },
		texw: { type: "f", value: 0.0 },
		texh: { type: "f", value: 0.0 },
		texLevels: { type: "f", value: 0.0 },
		alpha: { type: "f", value: 1.0 },
		threshold: { type: "f", value: 0.0, min: 0.0, max: 1.0 },
		color: { type: "v3", value: new Vector3(0.0, 0.0, 1.0) }
	};
	public static var vertexShader = FileReader.readFile("source/shaders/edt_display_demo.vertex");
	public static var fragmentShader = FileReader.readFile("source/shaders/edt_display_demo.fragment");
}