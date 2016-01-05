![Project logo](screenshots/webgl_distance_fields_logo.png?raw=true "WebGL Distance Fields Logo")

WORK IN PROGRESS

Fast Euclidean distance field generation and rendering using WebGL. Try the demo [in your browser](http://www.samcodes.co.uk/project/webgl-distance-fields/).

## Features ##
* Calculates distance fields in realtime on the GPU.
* Configurable generation and display settings.
* Drag-and-drop local images for conversion.

## Screenshots ##

![Screenshot](screenshots/screenshot1.png?raw=true "WebGL Distance Fields Screenshot 1")

![Screenshot](screenshots/screenshot2.png?raw=true "WebGL Distance Fields Screenshot 2")

## How It Works ##

This code computes the Euclidean distance transform of a texture in parallel on the GPU. It takes anti-aliased foreground edges into account, storing their grayscale values and producing fractional distances in the output texture.

The rendering shaders use the produced distance field textures as the input, and use a combination of thresholding and interpolation to approximate the shape of the foreground.

For a full explanation see this paper by [Stefan Gustavson](http://webstaff.itn.liu.se/~stegu/aadist/edtaa_preprint.pdf).

## Notes ##
* This was based on Chapter 12 of [OpenGL Insights](http://openglinsights.com/) by Stefan Gustavson.
* Uses actuate, msignal and Sure from [haxelib](http://lib.haxe.org/).
* Written using [Haxe](http://haxe.org/) and [three.js](http://threejs.org/).

## License ##
The distance field shaders are in the public domain. The rest is MIT licensed, except where noted otherwise.