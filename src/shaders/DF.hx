package shaders;

import util.FileReader;

// Displays distance fields as antialiased black using the red/green channels
class DF_DISPLAY_AA {
	public static var uniforms = {
		tDiffuse: { type: "t", value: null },
		texw: { type: "f", value: 0.0 },
		texh: { type: "f", value: 0.0 }
	};
	public static var vertexShader = FileReader.readFile("shaders/df.vertex");
	public static var fragmentShader = FileReader.readFile("shaders/df_display_rg.fragment");
}

// Displays distance fields as an RGB image
class DF_DISPLAY_RGB {
	public static var uniforms = {
		tDiffuse: { type: "t", value: null },
		texw: { type: "f", value: 0.0 },
		texh: { type: "f", value: 0.0 },
		texLevels: { type: "f", value: 0.0 }
	};
	public static var vertexShader = FileReader.readFile("shaders/df.vertex");
	public static var fragmentShader = FileReader.readFile("shaders/df_display_rgb.fragment");
}