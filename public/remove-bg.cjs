const Jimp = require('jimp');

async function removeBackground() {
    console.log("Reading image...");
    const img = await Jimp.read('logo-atualizada.png');
    
    // We want to make white and light-gray pixels completely transparent
    img.scan(0, 0, img.bitmap.width, img.bitmap.height, function(x, y, idx) {
        const r = this.bitmap.data[idx + 0];
        const g = this.bitmap.data[idx + 1];
        const b = this.bitmap.data[idx + 2];

        // If the pixel is close to white, make it transparent
        if (r > 210 && g > 210 && b > 210) {
            this.bitmap.data[idx + 3] = 0; // Set Alpha to 0
        }
    });

    await img.write('logo-atualizada.png'); // overwrite
    console.log("Saved transparent logo as logo-atualizada.png");
}

removeBackground().catch(console.error);
