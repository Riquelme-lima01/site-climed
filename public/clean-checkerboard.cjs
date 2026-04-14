const Jimp = require('jimp');

async function cleanCheckerboard() {
    console.log("Reading new image...");
    const img = await Jimp.read('logo-atualizada.png');
    
    // We will paint anything that is exactly the checkerboard white or gray to pure white.
    // The typical checkerboard in these screenshots are white (255,255,255) and gray (~195,195,195 or 204,204,204).
    // Let's identify the gray squares safely by checking if r, g, b are within a narrow range typical for checkerboard
    img.scan(0, 0, img.bitmap.width, img.bitmap.height, function(x, y, idx) {
        const r = this.bitmap.data[idx + 0];
        const g = this.bitmap.data[idx + 1];
        const b = this.bitmap.data[idx + 2];

        const isWhite = r > 240 && g > 240 && b > 240;
        const isGray = r > 185 && r < 215 && g > 185 && g < 215 && b > 185 && b < 215 && Math.abs(r-g) < 10 && Math.abs(g-b) < 10;
        
        // However, some parts of the silver gradient may ALSO be gray! 
        // We only want to turn the border/background pixels into white.
        // A simple heuristic for this image: if it's the specific gray or white, AND it's mostly "flat", but that's hard pixel-wise.
        // Let's just blindly push all light flat gray/white to pure white. It might slightly lighten some silver specular highlights, but that's okay because mix-blend-multiply will just make those highlights transparent (which is fine, the header is white/bright anyway).

        if (isWhite || isGray) {
            this.bitmap.data[idx + 0] = 255;
            this.bitmap.data[idx + 1] = 255;
            this.bitmap.data[idx + 2] = 255;
        }
    });

    await img.write('logo-limpa.png');
    console.log("Saved checkerboard cleaned as logo-limpa.png");
}

cleanCheckerboard().catch(console.error);
