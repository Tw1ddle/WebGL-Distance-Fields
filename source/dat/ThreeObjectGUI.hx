package dat;

import three.PointLight;
import three.Scene;
import three.Object3D;
import three.PointLight;

class ThreeObjectGUI {
	private static var guiItemCount:Int = 0;
	
	public static function addItem(gui:GUI, object:Dynamic, ?tag:String):GUI {
		if (gui == null || object == null) {
			return null;
		}
		
		var folder:GUI = null;
		
		if (tag != null) {
			folder = gui.addFolder(tag + " (" + guiItemCount++ + ")");
		} else {
			var name:String = Std.string(Reflect.field(object, "name"));
			
			if (name == null || name.length == 0) {
				folder = gui.addFolder("Item (" + guiItemCount++ + ")");
			} else {
				folder = gui.addFolder(Reflect.getProperty(object, "name") + " (" + guiItemCount++ + ")");
			}
		}
		
		if (Std.is(object, Scene)) {
			var scene:Scene = cast object;
			for (object in scene.children) {
				addItem(gui, object);
			}
		}
		
		if (Std.is(object, Object3D)) {
			var object3d:Object3D = cast object;
			
			folder.add(object3d.position, 'x', -5000.0, 5000.0, 2).listen();
			folder.add(object3d.position, 'y', -5000.0, 5000.0, 2).listen();
			folder.add(object3d.position, 'z', -20000.0, 20000.0, 2).listen();

			folder.add(object3d.rotation, 'x', -Math.PI * 2, Math.PI * 2, 0.01).listen();
			folder.add(object3d.rotation, 'y', -Math.PI * 2, Math.PI * 2, 0.01).listen();
			folder.add(object3d.rotation, 'z', -Math.PI * 2, Math.PI * 2, 0.01).listen();

			folder.add(object3d.scale, 'x', 0.0, 10.0, 0.01).listen();
			folder.add(object3d.scale, 'y', 0.0, 10.0, 0.01).listen();
			folder.add(object3d.scale, 'z', 0.0, 10.0, 0.01).listen();
		}
		
		if (Std.is(object, PointLight)) {
			var light:PointLight = cast object;
			
			folder.add(light, 'intensity', 0, 3, 0.01).listen();
		}
		
		return folder;
	}
}