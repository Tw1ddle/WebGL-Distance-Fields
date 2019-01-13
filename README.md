![Project logo](screenshots/webgl_distance_fields_logo.png?raw=true "WebGL Distance Fields Logo")

[![Build Status](https://img.shields.io/travis/Tw1ddle/WebGL-Distance-Fields.svg?style=flat-square)](https://travis-ci.org/Tw1ddle/WebGL-Distance-Fields)
[![License](https://img.shields.io/:license-mit-blue.svg?style=flat-square)](https://github.com/Tw1ddle/WebGL-Distance-Fields/blob/master/LICENSE)

Fast Euclidean distance field generation and rendering demo with three.js.

Try it [in your browser](http://tw1ddle.github.io/WebGL-Distance-Fields/). Type something. Hit backspace or delete to remove letters. Mousewheel to zoom.

## Features ##
* Calculates distance fields in realtime on the GPU.

## How It Works ##

Refer to the [generator code](https://github.com/Tw1ddle/WebGL-Distance-Fields/blob/master/sdf/generator/SDFMaker.hx), shaders and [readme](https://github.com/Tw1ddle/WebGL-Distance-Fields/tree/master/sdf).

## Screenshots ##

Realtime distance field generation from canvas text:

![Screenshot](https://github.com/Tw1ddle/WebGL-Distance-Fields/blob/master/screenshots/realtime.gif?raw=true "WebGL Distance Fields Realtime Screenshot")

Anti-aliased input (128x128):

![Screenshot](https://github.com/Tw1ddle/WebGL-Distance-Fields/blob/master/screenshots/screenshot1.png?raw=true "WebGL Distance Fields Screenshot 1")

Output rendered at (~700x700):

![Screenshot](https://github.com/Tw1ddle/WebGL-Distance-Fields/blob/master/screenshots/screenshot2.png?raw=true "WebGL Distance Fields Screenshot 2")

## Notes ##
* This is based on Chapter 12 of [OpenGL Insights](http://openglinsights.com/) by Stefan Gustavson.
* Inspired by Paul Houx's [text rendering sample](https://github.com/paulhoux/Cinder-Samples) for Cinder.
* Written using [Haxe](http://haxe.org/) and [three.js](http://threejs.org/).
* Uses the actuate and Sure [haxelibs](http://lib.haxe.org/).

## License ##
The distance field shaders are in the public domain. The rest is MIT licensed, unless noted otherwise.
