const Jimp = require('jimp');

async function removeWhite() {
    console.log("Reading image...");
    const img = await Jimp.read('logo-atualizada.png');
    
    // We want to make any pixel that is very close to white, transparent.
    // However, the text has shadows. Just making white 100% transparent will leave a hard white halo.
    // A better approach is to change pure white to transparent, and for light greys (which are the anti-aliased shadows fading to white), we turn them into black but adjust the alpha channel inversely!
    // If a pixel is (v, v, v), an ideal shadow pixel over white was originally black (0,0,0) with alpha A where v = 255*(1-A).
    // So A = 1 - (v/255).
    // New pixel should be (0, 0, 0, A * 255).
    
    img.scan(0, 0, img.bitmap.width, img.bitmap.height, function(x, y, idx) {
        const r = this.bitmap.data[idx + 0];
        const g = this.bitmap.data[idx + 1];
        const b = this.bitmap.data[idx + 2];
        const a = this.bitmap.data[idx + 3];

        if (r > 245 && g > 245 && b > 245) {
            // Pure white or very close to it
            this.bitmap.data[idx + 3] = 0; // completely transparent
        } else if (r > 150 && g > 150 && b > 150 && Math.abs(r-g) < 15 && Math.abs(g-b) < 15) {
            // It's a light gray shadow smoothing into white.
            // Estimate original alpha assuming a black shadow fading to white.
            // Actually, the text is silver, so it has bright areas. We can't just turn all light gray into black with alpha!
            // The 3D text itself might have white highlights. If we delete white, the highlights will become transparent holes!
            
            // To prevent highlights from disappearing: highlights are usually inside the text.
            // A simple "flood fill" or edge detection is tough.
        }
    });

    await img.write('logo-limpa.png');
    console.log("Saved as logo-limpa.png");
}

removeWhite().catch(console.error);
