const sharp = require('sharp');

// Input file
const inputFile = 'input.jpg';
// Output file
const outputFile = 'output.webp';

const outputQuality = 30;

sharp(inputFile)
  .webp({ quality: outputQuality })
  .toFile(outputFile, (err, info) => {
    if (err) {
      console.error(err);
    } else {
      console.log(`Optimized image to ${info.size} bytes`);
    }
  });

