package shaders;

import util.FileReader;

// Parallel euclidean distance transform
class EDT_FLOOD {	
	public static var uniforms = {
		tDiffuse: { type: "t", value: null },
		texLevels: { type: "f", value: 0.0 },
		texw: { type: "f", value: 0.0 },
		texh: { type: "f", value: 0.0 },
		step: { type: "f", value: 0.0 }
	};
	public static var vertexShader = FileReader.readFile("shaders/edt_flood.vertex");
	public static var fragmentShader = FileReader.readFile("shaders/edt_flood.fragment");
}

class EDT_SEED {
	public static var uniforms = {
		tDiffuse: { type: "t", value: null },
		texLevels: { type: "f", value: 0.0 }
	};
	public static var vertexShader = FileReader.readFile("shaders/edt_seed.vertex");
	public static var fragmentShader = FileReader.readFile("shaders/edt_seed.fragment");
}

// Displays distance field as antialiased black/white image
class EDT_DISPLAY_AA {
	public static var uniforms = {
		tDiffuse: { type: "t", value: null },
		texw: { type: "f", value: 0.0 },
		texh: { type: "f", value: 0.0 },
		texLevels: { type: "f", value: 0.0 },
		threshold: { type: "f", value: 0.0, min: 0.0, max: 1.0 }
	};
	public static var vertexShader = FileReader.readFile("shaders/edt_display.vertex");
	public static var fragmentShader = FileReader.readFile("shaders/edt_display_aa.fragment");
}

// Displays distance field as antialiased black/white with the original black image pixels, and the outline drawn in green
class EDT_DISPLAY_OVERLAY {
	public static var uniforms = {
		tDiffuse: { type: "t", value: null },
		texw: { type: "f", value: 0.0 },
		texh: { type: "f", value: 0.0 },
		texLevels: { type: "f", value: 0.0 },
		threshold: { type: "f", value: 0.0, min: 0.0, max: 1.0 }
	};
	public static var vertexShader = FileReader.readFile("shaders/edt_display.vertex");
	public static var fragmentShader = FileReader.readFile("shaders/edt_display_overlay.fragment");
}

// Displays distance field as an RGB image
class EDT_DISPLAY_RGB {
	public static var uniforms = {
		tDiffuse: { type: "t", value: null },
		texw: { type: "f", value: 0.0 },
		texh: { type: "f", value: 0.0 },
		texLevels: { type: "f", value: 0.0 }
	};
	public static var vertexShader = FileReader.readFile("shaders/edt_display.vertex");
	public static var fragmentShader = FileReader.readFile("shaders/edt_display_rgb.fragment");
}

// Flawed display method, alpha thresholding that produces wavy contours
class EDT_DISPLAY_ALPHA_THRESHOLD {
	public static var uniforms = {
		tDiffuse: { type: "t", value: null },
		texw: { type: "f", value: 0.0 },
		texh: { type: "f", value: 0.0 },
		texLevels: { type: "f", value: 0.0 },
		threshold: { type: "f", value: 0.0, min: 0.0, max: 1.0 }
	};
	public static var vertexShader = FileReader.readFile("shaders/edt_display.vertex");
	public static var fragmentShader = FileReader.readFile("shaders/edt_alpha_threshold.fragment");
}