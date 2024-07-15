import { Injectable } from '@nestjs/common'
import * as cloudinary from 'cloudinary'

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
    filePath: string,
    folderName: string,
  ): Promise<cloudinary.UploadApiResponse | cloudinary.UploadApiErrorResponse> {
    return new Promise((resolve, reject) => {
      cloudinary.v2.uploader.upload(filePath, { folder: folderName }, (error, result) => {
        if (error) return reject(error) 
        resolve(result)
      })
    })
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
