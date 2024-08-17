const Minio = require('minio');

class Logger {
  warn(data){
    console.log(data)
  }
  error(data){
    console.log(data)
  }
  debug(data){
    console.log(data)
  }
}

class BucketService {
  constructor() {
    this.MINIO_BUCKET = process.env.MINIO_BUCKET;
    this.logger = new Logger();
    this.minioClient = new Minio.Client({
      port: +process.env.MINIO_PORT,
      endPoint: process.env.MINIO_ENDPOINT,
      useSSL: process.env.MINIO_USE_SSL === 'true' || false,
      accessKey: process.env.MINIO_USER,
      secretKey: process.env.MINIO_PASSWORD,
      region: process.env.MINIO_REGION,
    });
  }

  async fileExistsInMinio(filename, folder) {
    const stream = this.minioClient.listObjects(this.MINIO_BUCKET, folder, true);
    for await (const obj of stream) {
      if (obj.name === `${folder}/${filename}`) {
        return true;
      }
    }

    return false;
  }

  async saveBase64ToMinio(base64Data, filename, folder) {

    if (!base64Data || !folder) {
      return { response: null, name: null, error: 'Invalid base64 data or folder'}
    }

    const fileBuffer = Buffer.from(base64Data, 'base64');
    const fileName = `${folder}/${filename}`;

    try {
      const minioResponse = await this.minioClient.putObject(
        this.MINIO_BUCKET,
        fileName,
        fileBuffer,
      );

      this.logger.debug(minioResponse);

      return { response: minioResponse, name: fileName, error: null}
    } catch (e) {
      console.error(e);
      return { response: null, name: null, error: 'Error al guardar el archivo en MinIO'}
    }
  }

  async getBase64ImageFromMinio(filename, folder) {
    const fileName = `${folder}/${filename}`;
    console.log({fileName})

    try {
      const data = await new Promise((resolve, reject) => {
          this.minioClient.getObject(this.MINIO_BUCKET, fileName, function(err, dataStream) {
            if (err) {
            return reject(err);
          }
          const chunks = [];
          dataStream.on('data', function(chunk) {
            chunks.push(chunk);
          });
          dataStream.on('end', function() {
            resolve(Buffer.concat(chunks));
          });
        });
      });

      return data
    } catch (e) {
      console.error(e);
      return null;
    }
  }

  async deleteFile(filename, folder) {
    try {
      await this.minioClient.removeObject(this.MINIO_BUCKET, `${folder}/${filename}`);
    } catch (error) {
      this.logger.error(`Error deleting images from MinIO: ${error}`);
      return { response: null, name: null, error: 'Failed to delete product images from MinIO'}
    }
  }

  async getFileUrl(objectName) {
    try {
      const url = await this.minioClient.presignedGetObject(
        this.MINIO_BUCKET,
        objectName,
      );

      if (!url) {
        return null;
      }

      return url.replace(process.env.MINIO_ENDPOINT, process.env.MINIO_CDN_ENDPOINT)
    } catch (e) {
      console.error(e);
      throw new Error('Error al obtener la URL del objeto de MinIO');
    }
  }
}

module.exports = { BucketService };
