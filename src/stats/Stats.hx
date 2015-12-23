package stats;

import js.html.DOMElement;

@:enum abstract Mode(Int) from Int to Int {
	var FPS = 0;
	var MS = 1;
	var MEM = 2;
}

@:native("Stats")
extern class Stats {
	public var domElement:DOMElement;
	
	public function new():Void;
	
	public function setMode(mode:Mode):Void;
	
	public function begin():Void;
	public function end():Void;
	public function update():Void;
}