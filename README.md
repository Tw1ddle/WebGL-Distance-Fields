![Project logo](screenshots/webgl_distance_fields_logo.png?raw=true "WebGL Distance Fields Logo")

WORK IN PROGRESS

Hardware-accelerated Euclidean distance field generator and renderer.

Try the demo [in your browser](http://www.samcodes.co.uk/project/webgl-distance-fields/).

Made using [three.js](http://threejs.org/) and [Haxe](http://haxe.org/).

## Features ##
* Generates distance fields in realtime on the GPU.
* Drag-and-drop local media for conversion.
* Configurable shader settings.

## How It Works ##

The distance field generation shaders perform a parallel Euclidean distance transform using the jump flooding algorithm. The distance field encodes information about the distance to the nearest contour of the foreground of the image.

The distance field renderer uses the distance field to generate smooth shapes through a combination of thresholding, interpolation and anti-aliasing.

## Screenshots ##

![Screenshot](screenshots/screenshot1.png?raw=true "WebGL Distance Fields Screenshot 1")

![Screenshot](screenshots/screenshot2.png?raw=true "WebGL Distance Fields Screenshot 2")

## Notes ##
* This was based on Chapter 12 of [OpenGL Insights](http://openglinsights.com/) by Stefan Gustavson.
* This uses the actuate, Sure and msignal Haxe libraries from [haxelib](http://lib.haxe.org/).

## License ##
The demo webpage is CC BY-NC. The distance field shaders are public domain. All other code is MIT licensed, unless otherwise noted.