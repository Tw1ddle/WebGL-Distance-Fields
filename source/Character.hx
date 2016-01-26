package;

import three.Mesh;
import three.Geometry;
import three.ShaderMaterial;
import js.html.TextMetrics;
import three.Vector3;

class Character extends Mesh {
	public var metrics(default, null):TextMetrics;
	public var width:Float;
	public var height:Float;
	public var uniforms:Dynamic;
	
	public var spawnPosition:Vector3;
	public var targetPosition:Vector3;
	
	public function new(geometry:Geometry, material:ShaderMaterial, width:Float, height:Float, metrics:TextMetrics) {
		super(geometry, material);
		
		this.width = width;
		this.height = height;
		
		this.metrics = metrics;
		this.uniforms = material.uniforms;
		
		this.spawnPosition = new Vector3(0, 0, 0);
		this.targetPosition = new Vector3(0, 0, 0);
	}
	
	public function create():Character {
		var mesh = super.clone();
		var ch:Character = cast mesh;
		ch.width = width;
		ch.height = height;
		ch.metrics = metrics;
		ch.spawnPosition = new Vector3(0, 0, 0);
		ch.targetPosition = new Vector3(0, 0, 0);
		ch.uniforms = uniforms;
		return ch;
	}
}