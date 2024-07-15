import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import { generateUpdateToken } from 'src/common/generate-update-token'
import { plainToInstance } from 'class-transformer'
import { Model } from 'mongoose'
import { InjectModel } from '@nestjs/mongoose'
import { User } from 'src/types/user'
import { deleteImage } from 'src/common/deleteImage'
import { Option } from 'src/types/option'
import { CreateOptionDTO, OptionDTO, UpdateOptionDTO } from 'src/dtos/option.dto'
import { Product } from 'src/types/product'

@Injectable()
export class OptionService {
  constructor(
    @InjectModel('Option') private optionModel: Model<Option>,
    @InjectModel('User') private userModel: Model<User>,
    @InjectModel('Product') private productModel: Model<Product>,
  ) {}

  async create(createOptionDTO: CreateOptionDTO, userid: string, optionImage: string): Promise<OptionDTO> {
    try {
      const user = await this.userModel.findOne({ _id: userid })

      if (!user) {
        throw new HttpException('Không tìm thấy người dùng !', HttpStatus.NOT_FOUND)
      }

      const option = new this.optionModel({
        ...createOptionDTO,
        updated_token: generateUpdateToken(),
        option_image: optionImage,
      })

      await option.save()

      return plainToInstance(OptionDTO, option, {
        excludeExtraneousValues: true,
      })
    } catch (err) {
      // deleteImage(optionImage)
      if (err instanceof HttpException) {
        throw err
      } else throw new HttpException('Lỗi server !', HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }

  async update(optionid: string, updateOptionDTO: UpdateOptionDTO, userid: string, newImage: string) {
    try {
      const user = await this.userModel.findOne({ _id: userid })
      const option = await this.optionModel.findOne({ _id: optionid })

      if (!user) {
        throw new HttpException('Không tìm thấy người dùng !', HttpStatus.NOT_FOUND)
      }

      if (!option) {
        throw new HttpException('Không tìm thấy option !', HttpStatus.NOT_FOUND)
      }

      if (option.updated_token !== updateOptionDTO.updated_token) {
        throw new HttpException('Sản phẩm đang được cập nhật bởi một ai đó !', HttpStatus.CONFLICT)
      }

      const oldImage = option.option_image

      const updateOptionData = {
        ...updateOptionDTO,
        updated_token: generateUpdateToken(),
        option_image: newImage ? newImage : oldImage,
      }

      const updateResult = await option.updateOne(updateOptionData)

      const product = await this.productModel.findOne({ _id: updateOptionDTO.product })

      if (product) {
        const existingItemIndex = product?.options.findIndex((item) => item.id === optionid)

        if (existingItemIndex === -1) {
          throw new HttpException('Sản phẩm không có option tương ứng !', HttpStatus.CONFLICT)
        }
      } else {
        throw new HttpException('Không tìm thấy sản phẩm !', HttpStatus.NOT_FOUND)
      }

      await product.updateOne({ updated_token: generateUpdateToken(), updated_by: user, updated_date: Date.now() })

      if (updateResult.modifiedCount > 0) {
        if (newImage) {
          deleteImage(oldImage)
        }
        return { message: 'Cập nhật thành công !' }
      } else {
        throw new HttpException('Cập nhật thất bại !', HttpStatus.NOT_IMPLEMENTED)
      }
    } catch (err) {
      deleteImage(newImage)
      if (err instanceof HttpException) {
        throw err
      } else {
        throw new HttpException('Lỗi mạng !', HttpStatus.INTERNAL_SERVER_ERROR)
      }
    }
  }
}
