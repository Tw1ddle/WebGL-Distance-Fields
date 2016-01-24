package dat;

import dat.GUI;

class ShaderGUI {
	public static function generate(gui:GUI, folderName:String, uniforms:Dynamic, ?exclude:Array<String>):Void {
		var keys = Reflect.fields(uniforms);
		
		var folder = gui.addFolder(folderName);
		
		for (key in keys) {
			var v = Reflect.getProperty(uniforms, key);
			
			if (exclude != null && exclude.indexOf(key) != -1) {
				continue;
			}
			
			var type = v.type;
			var value = v.value;
			
			switch(type) {
				case "f":
					if (Reflect.hasField(v, "min") && Reflect.hasField(v, "max")) {
						folder.add(v, 'value').listen().min(v.min).max(v.max).name(key);
					} else {
						folder.add(v, 'value').listen().name(key);
					}
				case "v2":
					var f = folder.addFolder(key);
					f.add(v.value, 'x').listen().name(key + "_x");
					f.add(v.value, 'y').listen().name(key + "_y");
			}
		}
	}
}