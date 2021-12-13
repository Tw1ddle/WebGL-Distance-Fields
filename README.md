![Project logo](screenshots/webgl_distance_fields_logo.png?raw=true "WebGL Distance Fields Logo")

[![Build Status](https://img.shields.io/travis/Tw1ddle/WebGL-Distance-Fields.svg?style=flat-square)](https://travis-ci.org/Tw1ddle/WebGL-Distance-Fields)
[![License](https://img.shields.io/:license-mit-blue.svg?style=flat-square)](https://github.com/Tw1ddle/WebGL-Distance-Fields/blob/master/LICENSE)

Fast Euclidean distance field generation and rendering demo. Run it [in the browser](https://tw1ddle.github.io/WebGL-Distance-Fields/).

## Usage

The demo performs realtime distance field generation from text drawn on a HTML5 canvas. Type something to add letters, hit backspace or delete to remove letters, use mousewheel to zoom.

[![Screenshot](https://github.com/Tw1ddle/WebGL-Distance-Fields/blob/master/screenshots/realtime.gif?raw=true "WebGL Distance Fields Realtime Screenshot")](https://tw1ddle.github.io/WebGL-Distance-Fields/)

## How It Works

The technique is based on Chapter 12 of [OpenGL Insights](https://openglinsights.com/) by Stefan Gustavson. Refer to the [generator code](https://github.com/Tw1ddle/WebGL-Distance-Fields/blob/master/sdf/generator/SDFMaker.hx), shaders and [readme](https://github.com/Tw1ddle/WebGL-Distance-Fields/tree/master/sdf).

Anti-aliased input (128x128):

![Screenshot](https://github.com/Tw1ddle/WebGL-Distance-Fields/blob/master/screenshots/screenshot1.png?raw=true "WebGL Distance Fields Screenshot 1")

Output rendered at (~700x700):

![Screenshot](https://github.com/Tw1ddle/WebGL-Distance-Fields/blob/master/screenshots/screenshot2.png?raw=true "WebGL Distance Fields Screenshot 2")

## Notes
* The demo was inspired by Paul Houx's [text rendering sample](https://github.com/paulhoux/Cinder-Samples) for Cinder.
* Written using [Haxe](https://haxe.org/) and [three.js](https://threejs.org/).
* Uses the actuate and Sure [haxelibs](https://lib.haxe.org/).

## License
 * The distance field shaders are in the public domain. The rest of the code is provided under the MIT license, unless noted otherwise.
 * Got an idea or suggestion? Open an issue on GitHub, or send Sam a message on [Twitter](https://twitter.com/Sam_Twidale).