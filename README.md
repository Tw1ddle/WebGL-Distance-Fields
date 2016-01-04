![Project logo](screenshots/webgl_distance_fields_logo.png?raw=true "WebGL Distance Fields Logo")

WORK IN PROGRESS

Hardware-accelerated Euclidean distance field generator and renderer. Try the demo [in your browser](http://www.samcodes.co.uk/project/webgl-distance-fields/).

## Features ##
* Generates distance fields in realtime on the GPU.
* Drag-and-drop local media for conversion.
* Configurable shader settings.

## How It Works ##

The distance field generation shaders calculate the Euclidean distance transform using the jump flooding algorithm by [Guodong Rong](http://www.comp.nus.edu.sg/~tants/jfa/i3d06.pdf), based on an implementation by [Stefan Gustavson](https://github.com/OpenGLInsights/OpenGLInsightsCode).

The distance from the nearest contour of the foreground of the image is encoded into the output texture, along with an additional value for anti-aliased edges. The distance field renderer uses this information to draw smooth shapes through a combination of thresholding, interpolation and anti-aliasing.

## Screenshots ##

![Screenshot](screenshots/screenshot1.png?raw=true "WebGL Distance Fields Screenshot 1")

![Screenshot](screenshots/screenshot2.png?raw=true "WebGL Distance Fields Screenshot 2")

## Notes ##
* This was based on Chapter 12 of [OpenGL Insights](http://openglinsights.com/) by Stefan Gustavson.
* Made using [three.js](http://threejs.org/) and [Haxe](http://haxe.org/).
* This uses actuate, msignal and Sure from [haxelib](http://lib.haxe.org/).

## License ##
The demo webpage is CC BY-NC. The distance field shaders are in the public domain. All other code is MIT licensed, unless otherwise noted.