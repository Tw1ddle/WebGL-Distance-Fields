![Project logo](screenshots/webgl_distance_fields_logo.png?raw=true "WebGL Distance Fields Logo")

Fast Euclidean distance field generation and rendering example using WebGL. Try it [in your browser](http://tw1ddle.github.io/WebGL-Distance-Fields/).

## Features ##
* Calculates distance fields in realtime on the GPU.

## Screenshots ##

![Screenshot](https://github.com/Tw1ddle/WebGL-Distance-Fields/blob/master/screenshots/realtime.gif?raw=true "WebGL Distance Fields Realtime Screenshot")

Anti-aliased input (128x128):

![Screenshot](https://github.com/Tw1ddle/WebGL-Distance-Fields/blob/master/screenshots/screenshot1.png?raw=true "WebGL Distance Fields Screenshot 1")

Output rendered at (~700x700):

![Screenshot](https://github.com/Tw1ddle/WebGL-Distance-Fields/blob/master/screenshots/screenshot2.png?raw=true "WebGL Distance Fields Screenshot 2")

## Notes ##
* This was based on Chapter 12 of [OpenGL Insights](http://openglinsights.com/) by Stefan Gustavson.
* Uses actuate and Sure from [haxelib](http://lib.haxe.org/).
* Written using [Haxe](http://haxe.org/) and [three.js](http://threejs.org/).

## License ##
The distance field shaders are in the public domain. The rest is MIT licensed, except where noted otherwise.