![Project logo](screenshots/webgl_distance_fields_logo.png?raw=true "WebGL Distance Fields Logo")

WORK IN PROGRESS

Fast Euclidean distance field generation and renderering using WebGL. Try the demo [in your browser](http://www.samcodes.co.uk/project/webgl-distance-fields/).

## Features ##
* Generates distance fields in realtime with the GPU.
* Drag-and-drop local media for conversion.
* Configurable shader settings.

## How It Works ##

The distance field generation shaders calculate the Euclidean distance transform of textures using the jump flooding algorithm by [Guodong Rong](http://www.comp.nus.edu.sg/~tants/jfa/i3d06.pdf), and is based on an implementation by [Stefan Gustavson](https://github.com/OpenGLInsights/OpenGLInsightsCode).

The distance from the nearest contour of the foreground of the image is encoded into the output texture, along with an additional value for anti-aliased edges. The distance field renderer uses this information to draw smooth shapes through a combination of thresholding, interpolation and anti-aliasing.

## Screenshots ##

![Screenshot](screenshots/screenshot1.png?raw=true "WebGL Distance Fields Screenshot 1")

![Screenshot](screenshots/screenshot2.png?raw=true "WebGL Distance Fields Screenshot 2")

## Notes ##
* This was based on Chapter 12 of [OpenGL Insights](http://openglinsights.com/) by Stefan Gustavson.
* Uses actuate, msignal and Sure from [haxelib](http://lib.haxe.org/).
* Written using [Haxe](http://haxe.org/) and [three.js](http://threejs.org/).

## License ##
The demo webpage is CC BY-NC. The distance field shaders are in the public domain. The rest is MIT, unless otherwise noted.