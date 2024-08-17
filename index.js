require('dotenv').config()
const sharp = require('sharp');
const path = require('path');
const { BucketService } = require('./bucket.service');
const bucketService = new BucketService();

function removeExtension(filename) {
  return path.parse(filename).name;
}

const folder = 'experiences/17';
const filename = '749ede23-02d5-4958-b796-515567d317a8.png';
const outputQuality = 80;

const getdata = async () => {
  return await bucketService.getBase64ImageFromMinio(filename, folder);
}

getdata()
  .then((data) => {

    sharp(data)
      .webp({ quality: outputQuality })
      .toBuffer(async (err, buffer, info) => {
        if (err) {
          console.error(err);
        } else {
          const newFilename = `optimized_${filename}`;
          const base64Image = buffer.toString('base64');
          await bucketService.saveBase64ToMinio(base64Image, newFilename, folder);
        }
      });

  })
  .catch(err => {
      console.log(err)
  })

