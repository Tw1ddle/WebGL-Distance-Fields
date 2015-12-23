package composer;

import three.*;

@:native("THREE.RenderPass") extern class RenderPass {
	public function new(scene:Scene, camera:Camera, ?overrideMaterial:Material, ?clearColor:Color, ?clearAlpha:Bool):Void;
	public function render(renderer:Renderer, writeBuffer:Dynamic, readBuffer:Dynamic):Void;
}