package;

import three.Mesh;
import three.Geometry;
import three.ShaderMaterial;
import js.html.TextMetrics;

class Character extends Mesh {
	public var metrics(default, null):TextMetrics;
	public var width:Float;
	public var height:Float;
	
	public function new(geometry:Geometry, material:ShaderMaterial, width:Float, height:Float, metrics:TextMetrics) {
		super(geometry, material);
		
		this.width = width;
		this.height = height;
		
		this.metrics = metrics;
	}
	
	public function create():Character {
		var mesh = super.clone();
		var ch:Character = cast mesh;
		ch.width = width;
		ch.height = height;
		ch.metrics = metrics;
		return ch;
	}
}