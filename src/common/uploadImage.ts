import { Injectable } from '@nestjs/common'
import * as cloudinary from 'cloudinary'
const streamifier = require('streamifier')
@Injectable()
export class CloudinaryService {
  constructor() {
    cloudinary.v2.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    })
  }

  async uploadImage(
    file: any,
  ): Promise<cloudinary.UploadApiResponse | cloudinary.UploadApiErrorResponse> {
    return new Promise((resolve, reject) => {
            let stream = cloudinary.v2.uploader.upload_stream(
              (error, result) => {
                if (result) {
                  resolve(result);
                } else {
                  reject(error);
                }
              }
            );

          streamifier.createReadStream(file.buffer).pipe(stream);
        });
  }

  // async deleteImage(
  //   filePath: string,
  // ): Promise<cloudinary.UploadApiResponse | cloudinary.UploadApiErrorResponse> {
  //   return new Promise((reject) => {
  //     cloudinary.v2.uploader.destroy(filePath, (error) => {
  //       if (error) return reject(error)
  //     })
  //   })
  // }
}
