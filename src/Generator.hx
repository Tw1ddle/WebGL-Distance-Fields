package;

import js.Browser;
import three.Texture;
import three.ImageUtils;

class Generator {
	// TODO use this to generate text
	public static function generateTexture():Dynamic {
		// Draw a circle in the center of the canvas
		var size = 128;
		
		// Create canvas
		var canvas = cast Browser.document.createElement('canvas');
		canvas.width = size;
		canvas.height = size;
		
		// Get context
		var context = canvas.getContext('2d');
		
		// Draw circle
		var centerX = size / 2;
		var centerY = size / 2;
		var radius = size / 2;
		
		context.beginPath();
		context.arc(centerX, centerY, radius, 0, Math.PI / 2, false);
		context.fillStyle = "#ffffff";
		context.fill();

		return canvas;
	}
}