const Jimp = require('jimp');

async function cleanWhite() {
    console.log("Reading image...");
    const img = await Jimp.read('logo-atualizada.png');
    
    img.scan(0, 0, img.bitmap.width, img.bitmap.height, function(x, y, idx) {
        const r = this.bitmap.data[idx + 0];
        const g = this.bitmap.data[idx + 1];
        const b = this.bitmap.data[idx + 2];
        const a = this.bitmap.data[idx + 3];

        // If pixel is very light (light gray/off-white artifacts), force it to pure white
        // This makes mix-blend-multiply effectively render it perfectly transparent
        if (r > 220 && g > 220 && b > 220) {
            this.bitmap.data[idx + 0] = 255;
            this.bitmap.data[idx + 1] = 255;
            this.bitmap.data[idx + 2] = 255;
            // keep alpha as is
        }
    });

    await img.write('logo-limpa.png');
    console.log("Saved as logo-limpa.png");
}

cleanWhite().catch(console.error);
