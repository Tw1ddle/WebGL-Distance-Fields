package;

import binpacking.Rect;
import binpacking.SimplifiedMaxRectsPacker;
import haxe.ds.ObjectMap;
import haxe.ds.StringMap;
import three.PixelFormat;
import three.TextureDataType;
import three.TextureFilter;
import three.WebGLRenderTarget;
import three.Wrapping;

typedef BinMap = ObjectMap<SimplifiedMaxRectsPacker, Array<{ rect: Rect, sdf: WebGLRenderTarget }>>;

class SDFAtlasMaker {
	private var sdfMap:StringMap<WebGLRenderTarget>;
	
	public function new(sdfMap:StringMap<WebGLRenderTarget>) {
		this.sdfMap = sdfMap;
	}
	
	private function buildBinMap():BinMap {
		var bins = new Array<SimplifiedMaxRectsPacker>();
		
		var binSize = getStartingBinSize(1024, 1024); // TODO get default bin size
		
		bins.push(new SimplifiedMaxRectsPacker(binSize.width, binSize.height));
		
		var binMap = new BinMap();
		
		// For each distance field, try to insert the item into a bin, if the item won't fit in a bin then create a new bin
		for (sdf in sdfMap) {
			var inserted:Bool = false;
			
			for (bin in bins) {
				var rect = bin.insert(sdf.width, sdf.height);
				if (rect != null) {
					inserted = true;
					break;
				}
			}
			
			if (!inserted) {
				var newBin = new SimplifiedMaxRectsPacker(binSize.width, binSize.height);
				var newRect = newBin.insert(sdf.width, sdf.height);
				Sure.sure(newRect != null);
				bins.push(newBin);
			}
		}
		
		return binMap;
	}
	
	private function writeTextures(map:BinMap):Array<WebGLRenderTarget> {
		// Exit early if no distance fields have been generated yet
		if (sdfCount() == 0) {
			return [];
		}
		
		// Create a rendertarget for each bin
		var renderTargetParams = {
			minFilter: TextureFilter.NearestFilter,
			magFilter: TextureFilter.NearestFilter,
			wrapS: Wrapping.ClampToEdgeWrapping,
			wrapT: Wrapping.ClampToEdgeWrapping,
			format: cast PixelFormat.RGBAFormat,
			stencilBuffer: false,
			depthBuffer: false,
			type: TextureDataType.UnsignedByteType
		};
		var targets = new Array<WebGLRenderTarget>();
		for (bin in map.keys()) {
			var binWidth = bin.binWidth;
			var binHeight = bin.binHeight;
			
			var target = new WebGLRenderTarget(binWidth, binHeight, renderTargetParams);
			
			var data = map.get(bin);
			for (item in data) {
				// TODO draw the SDF to the texture with the rect's x,y,w,h, or construct scenes and draw them all at once
				item.rect.x;
				item.rect.y;
				item.rect.width;
				item.rect.height;
				item.sdf;
			}
		}
		return targets;
	}
	
	private function generateJson(map:BinMap):String {
		return "todo";
	}
	
	private function getStartingBinSize(defaultWidth:Int, defaultHeight:Int): { width:Int, height:Int } {		
		// Set the lower width and height bounds to the size of the largest render target rounded up to the nearest power of 2
		var maxWidth:Int = 0;
		var maxHeight:Int = 0;
		for (sdf in sdfMap) {
			if (sdf.width > maxWidth) {
				maxWidth = Std.int(sdf.width);
			}
			if (sdf.height > maxHeight) {
				maxHeight = Std.int(sdf.height);
			}
		}
		maxWidth = nextPowerOfTwo(maxWidth);
		maxHeight = nextPowerOfTwo(maxHeight);
		if (maxWidth > defaultWidth) {
			defaultWidth = maxWidth;
		}
		if (maxHeight > defaultHeight) {
			defaultHeight = maxHeight;
		}
		
		return { width:defaultWidth, height:defaultHeight };
	}
	
	// Number of map entries
	private inline function sdfCount():Int {
		var count:Int = 0;
		for (sdf in sdfMap) {
			count++;
		}
		return count;
	}
	
	// Gets the next power of two >= the supplied value
	private inline function nextPowerOfTwo(x:Int):Int {
		var power:Int = 1;
		while (power < x) {
			power *= 2;
		}
		return power;
	}
}