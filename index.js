const sharp = require('sharp');
const BucketService = require('./bucket.service');
const bucketService = new BucketService();

const inputFile = 'input.jpg';
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

