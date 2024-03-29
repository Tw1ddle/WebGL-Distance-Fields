![Project logo](https://github.com/Tw1ddle/WebGL-Distance-Fields/blob/master/screenshots/webgl_distance_fields_logo.png?raw=true "WebGL Distance Fields Logo")

[![License](https://img.shields.io/:license-mit-blue.svg?style=flat-square)](https://github.com/Tw1ddle/WebGL-Distance-Fields/blob/master/sdf/LICENSE)
[![Build Status Badge](https://ci.appveyor.com/api/projects/status/github/Tw1ddle/Rectangle-Bin-Packing-Demo)](https://ci.appveyor.com/project/Tw1ddle/Rectangle-Bin-Packing-Demo)

Work in progress. Fast WebGL Euclidean distance field generation library, written in Haxe.

Try the demo out now [in your browser](https://tw1ddle.github.io/WebGL-Distance-Fields/).

## Features ##
* Calculates distance fields in realtime on the GPU.
* ~~Bin packing/distance field spritesheet generation.~~

## Usage ##

Refer to the demo [source code](https://github.com/Tw1ddle/WebGL-Distance-Fields).

## How It Works ##

This library computes the Euclidean distance transform of a texture in parallel on the GPU, taking anti-aliased foreground edges into account and producing fractional distances in the distance field texture output.

The rendering shaders use thresholding and interpolation on the distance field texture to render foreground shapes.

For a full explanation see this site from the inventors of this method, [Stefan Gustavson and Robin Strand](https://contourtextures.wikidot.com/).

## Screenshots ##

Anti-aliased input (128x128):

![Screenshot](https://github.com/Tw1ddle/WebGL-Distance-Fields/blob/master/screenshots/screenshot1.png?raw=true "WebGL Distance Fields Screenshot 1")

Output rendered at (~700x700):

![Screenshot](https://github.com/Tw1ddle/WebGL-Distance-Fields/blob/master/screenshots/screenshot2.png?raw=true "WebGL Distance Fields Screenshot 2")

## Notes ##
* This is based on Chapter 12 of [OpenGL Insights](https://openglinsights.com/) by Stefan Gustavson.
* Uses the Sure and bin-packer [haxelibs](https://lib.haxe.org/).
* Written using [Haxe](https://haxe.org/) and [three.js](https://threejs.org/).

## License ##
The distance field shaders are in the public domain. The rest is MIT licensed, unless noted otherwise.