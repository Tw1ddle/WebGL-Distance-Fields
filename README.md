![Project logo](screenshots/webgl_distance_fields_logo.png?raw=true "WebGL Distance Fields Logo")

Hardware-accelerated Euclidean distance field generator and renderer. Made for signed distance field fonts and text rendering.

Try it out now [in your browser](http://www.samcodes.co.uk/project/webgl-distance-fields/).

Made using [three.js](http://threejs.org/) and [Haxe](http://haxe.org/).

## Features ##
* Generates and renders distance fields in realtime.
* Drag-and-drop custom media for conversion.
* Extra fast approximate anti-aliasing.
* Configurable shader settings.

## Usage ##

Try the [demo](http://www.samcodes.co.uk/project/webgl-distance-fields/) in your browser. Try feeding it some images or videos, such as:

```
https://www.youtube.com/watch?v=WvAvEcxwglI
https://www.youtube.com/watch?v=G3C-VevI36s
https://www.youtube.com/watch?v=F_9InURkQNs
https://www.youtube.com/watch?v=_PLq0_7k1jk
```

## Screenshots ##

![Screenshot](screenshots/screenshot1.png?raw=true "WebGL Distance Fields Screenshot 1")

![Screenshot](screenshots/screenshot2.png?raw=true "WebGL Distance Fields Screenshot 2")

## How It Works ##

The distance field generator performs a parallel Euclidean distance transform using a jump flooding algorithm. It creates a distance field, where each texel encodes information about the distance to the nearest contour of the foreground of the image.

The distance field renderer uses the distance field to generate smooth shapes through a combination of thresholding, interpolation and anti-aliasing.

## Notes ##
* The parallel Euclidean distance transform and rendering shaders are based on Chapter 12 of [OpenGL Insights](http://openglinsights.com/) by Stefan Gustavson.
* This uses the Haxe libraries actuate, msignal and Sure. You can get these from [haxelib](http://lib.haxe.org/).
* If you have any questions or suggestions then [get in touch](http://samcodes.co.uk/contact).

## License ##
The demo webpage is CC BY-NC. The distance field shaders are public domain. All other code is MIT licensed, unless otherwise noted.