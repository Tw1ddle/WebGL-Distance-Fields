package composer;

import three.Camera;
import three.Color;
import three.Material;
import three.Scene;
import three.WebGLRenderer;

@:native("THREE.RenderPass") extern class RenderPass {
	public function new(scene:Scene, camera:Camera, ?overrideMaterial:Material, ?clearColor:Color, ?clearAlpha:Bool):Void;
	public function render(renderer:WebGLRenderer, writeBuffer:Dynamic, readBuffer:Dynamic):Void;
	
	public var scene:Scene;
	public var camera:Camera;
	public var overrideMaterial:Material;
	public var clearColor:Color;
	public var clearAlpha:Bool;
	public var enabled:Bool;
	public var clear:Bool;
	public var needsSwap:Bool;
}