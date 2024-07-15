import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import { generateUpdateToken } from 'src/common/generate-update-token'
import { plainToInstance } from 'class-transformer'
import { Category } from 'src/types/category'
import { Model } from 'mongoose'
import { InjectModel } from '@nestjs/mongoose'
import { User } from 'src/types/user'
import { deleteImage } from 'src/common/deleteImage'
import { CreateProductDTO, FilterProductDTO, ProductDTO, UpdateProductDTO } from 'src/dtos/product.dto'
import { Product } from 'src/types/product'
import { Option } from 'src/types/option'
import mongoose from 'mongoose'

export interface PaginatedProduct {
  data: ProductDTO[]
  page: number
  limit: number
  totalCount: number
  totalPage: number
}

@Injectable()
export class ProductService {
  constructor(
    @InjectModel('Category') private categoryModel: Model<Category>,
    @InjectModel('Product') private productModel: Model<Product>,
    @InjectModel('User') private userModel: Model<User>,
    @InjectModel('Option') private optionModel: Model<Option>,
  ) {}

  async create(
    createProductDTO: CreateProductDTO,
    userid: string,
    productImage: string,
    product3d: string,
  ): Promise<ProductDTO> {
    try {
      const user = await this.userModel.findOne({ _id: userid })
      const category = await this.categoryModel.findOne({
        _id: createProductDTO.category,
      })

      if (!user) {
        throw new HttpException('Không tìm thấy người dùng !', HttpStatus.NOT_FOUND)
      }

      if (!category) {
        throw new HttpException('Không tìm thấy loại sản phẩm !', HttpStatus.NOT_FOUND)
      }

      const tempPrice = await this.getTempPrice(createProductDTO.options)

      const product = new this.productModel({
        ...createProductDTO,
        category: category,
        temp_price: tempPrice ? tempPrice : 0,
        updated_token: generateUpdateToken(),
        product_image: productImage,
        product_3d: product3d,
        created_by: user,
      })

      await product.save()

      return plainToInstance(ProductDTO, product, {
        excludeExtraneousValues: true,
      })
    } catch (err) {
      // deleteImage(productImage)
      if (err instanceof HttpException) {
        throw err
      } else {
        console.log(err)
        throw new HttpException('Lỗi server !', HttpStatus.INTERNAL_SERVER_ERROR)
      }
    }
  }

  async update(productId: string, updateProductDTO: UpdateProductDTO, userid: string, newImage: string) {
    try {
      const user = await this.userModel.findOne({ _id: userid })
      const category = await this.categoryModel.findOne({
        _id: updateProductDTO.category,
      })
      const product = await this.productModel.findOne({ _id: productId })

      if (!user) {
        throw new HttpException('User not found', HttpStatus.NOT_FOUND)
      }

      if (!category) {
        throw new HttpException('Category not found', HttpStatus.NOT_FOUND)
      }

      if (!product) {
        throw new HttpException('Product not found', HttpStatus.NOT_FOUND)
      }

      if (product.updated_token !== updateProductDTO.updated_token) {
        throw new HttpException('Product is being updated by another user', HttpStatus.CONFLICT)
      }

      const oldImage = product.product_image

      const tempPrice = await this.getTempPrice(updateProductDTO.options)

      const updateProductData = {
        ...updateProductDTO,
        updated_token: generateUpdateToken(),
        updated_by: user,
        temp_price: tempPrice,
        product_image: newImage ? newImage : oldImage,
        updated_date: Date.now(),
      }

      if (product.deleted_at) {
        throw new HttpException('Sản phẩm đã bị xóa !', HttpStatus.CONFLICT)
      } else {
        const updateResult = await product.updateOne(updateProductData)

        if (updateResult.modifiedCount > 0) {
          if (newImage) {
            deleteImage(oldImage)
          }
          return { message: 'Cập nhật thành công !' }
        } else {
          throw new HttpException('Cập nhật thất bại !', HttpStatus.NOT_IMPLEMENTED)
        }
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

  async getAll(
    page: number,
    limit: number,
    isAdmin: boolean,
    filterProductDTO: FilterProductDTO,
  ): Promise<PaginatedProduct> {
    try {
      const query: any = {
        deleted_at: null,
        ...(isAdmin ? {} : { is_actived: true }),
      }

      if (filterProductDTO) {
        if (filterProductDTO.searchText) {
          query.$or = [
            { product_name: { $regex: new RegExp(filterProductDTO.searchText, 'i') } },
            { description: { $regex: new RegExp(filterProductDTO.searchText, 'i') } },
          ]
        }

        if (filterProductDTO.minPrice !== undefined || filterProductDTO.maxPrice !== undefined) {
          query.temp_price = {
            $gte: filterProductDTO.minPrice !== undefined ? filterProductDTO.minPrice : 0,
            $lte: filterProductDTO.maxPrice !== undefined ? filterProductDTO.maxPrice : Number.MAX_SAFE_INTEGER,
          }
        }

        if ((filterProductDTO.selectedCategories) && filterProductDTO.selectedCategories.length > 0) {
          query.category = { $in: filterProductDTO.selectedCategories }
        }

        if (isAdmin && filterProductDTO.is_actived !== undefined) {
          query.is_actived = filterProductDTO.is_actived
        }
      }
      let sort = {}

      switch (filterProductDTO.optionSort) {
        case 'inprice':
          sort = { temp_price: 1 }
          break
        case 'deprice':
          sort = { temp_price: -1 }
          break
        case 'sold':
          sort = { order_number: 1 }
          break
        case 'popular':
          sort = { view_number: 1 }
          break
        default:
          sort = { created_date: -1 }
          break
      }

      const products = await this.productModel
        .find(query)
        .populate('category')
        .populate('created_by')
        .populate('updated_by')
        .populate({
          path: 'options',
          options: { sort: { price: 1 } },
        })
        .sort({ ...sort } as any)
        .skip((page - 1) * limit)
        .limit(limit)

      const totalCount = (await this.productModel.find(query)).length

      const totalPage = Math.ceil(totalCount / limit)

      return {
        data: plainToInstance(ProductDTO, products, {
          excludeExtraneousValues: true,
          enableImplicitConversion: true,
        }),
        page,
        limit,
        totalCount,
        totalPage,
      }
    } catch (error) {
      if (error instanceof HttpException) {
        throw error
      } else {
        throw new HttpException('Lỗi mạng', HttpStatus.INTERNAL_SERVER_ERROR)
      }
    }
  }

  async delete(productId: string) {
    try {
      const product = await this.productModel.findOne({ _id: productId })

      if (!product) {
        throw new HttpException('Product not found', HttpStatus.NOT_FOUND)
      }

      const oldImage = product.product_image

      if (product.deleted_at) {
        throw new HttpException('Product have been deleted', HttpStatus.CONFLICT)
      } else {
        const updateResult = await product.updateOne({
          deleted_at: Date.now(),
          updated_token: generateUpdateToken(),
        })
        if (updateResult.modifiedCount > 0) {
          deleteImage(oldImage)
          return { message: 'Delete successfully' }
        } else {
          throw new HttpException('Delete fail', HttpStatus.NOT_IMPLEMENTED)
        }
      }
    } catch (err) {
      if (err instanceof HttpException) {
        throw err
      } else {
        throw new HttpException('Internal server error', HttpStatus.INTERNAL_SERVER_ERROR)
      }
    }
  }

  private async getTempPrice(options: string[]) {
    const newOptions = []

    for (const id of options) {
      const newId = new mongoose.Types.ObjectId(id)

      newOptions.push(newId)
    }
    const result = await this.optionModel.aggregate([
      {
        $match: {
          _id: { $in: newOptions },
        },
      },
      {
        $sort: { price: 1 },
      },
      {
        $limit: 1,
      },
    ])
    return result.length > 0 ? result[0].price : null
  }
}
