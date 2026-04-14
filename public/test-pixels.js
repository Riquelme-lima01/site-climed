const Jimp = require('jimp');

async function test() {
    const img = await Jimp.read('logo-atualizada.png');
    let colors = new Set();
    for(let y=0; y<20; y++) {
        for(let x=0; x<20; x++) {
            const hex = img.getPixelColor(x, y);
            const rgba = Jimp.intToRGBA(hex);
            colors.add(`${rgba.r},${rgba.g},${rgba.b}`);
        }
    }
    console.log([...colors]);
}
test().catch(console.error);
