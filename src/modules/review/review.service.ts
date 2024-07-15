import { HttpException, HttpStatus, Injectable, Response } from '@nestjs/common'
import { generateUpdateToken } from 'src/common/generate-update-token'
import { plainToInstance } from 'class-transformer'
import { Model } from 'mongoose'
import { InjectModel } from '@nestjs/mongoose'
import { User } from 'src/types/user'
import { CreateReviewDTO, ReviewDTO, UpdateReviewDTO } from 'src/dtos/review.dto'
import { Product } from 'src/types/product'
import { Review } from 'src/types/review'
import { Order } from 'src/types/order'
import { OrderStatus } from 'src/enums/order.enum'

export interface PaginatedReview {
  data: ReviewDTO[]
  page: number
  limit: number
  totalCount: number
  totalPage: number
}

@Injectable()
export class ReviewService {
  constructor(
    @InjectModel('Product') private productModel: Model<Product>,
    @InjectModel('Review') private reviewModel: Model<Review>,
    @InjectModel('User') private userModel: Model<User>,
    @InjectModel('Order') private orderModel: Model<Order>,
  ) {}

  async create(createReviewDTO: CreateReviewDTO, userid: string): Promise<ReviewDTO> {
    try {
      const user = await this.userModel.findOne({ _id: userid })
      const product = await this.productModel.findOne({ _id: createReviewDTO.product })
      const orders = await this.orderModel.find({
        user: userid,
        'products.product': createReviewDTO.product,
        status: OrderStatus.IN_RATING,
        _id: createReviewDTO.order,
      })

      if (!user) {
        throw new HttpException('Không tìm thấy người dùng !', HttpStatus.NOT_FOUND)
      }

      if (!product) {
        throw new HttpException('Không tìm thấy sản phẩm !', HttpStatus.NOT_FOUND)
      }

      if (orders.length === 0) {
        throw new HttpException('Bạn chưa mua sản phẩm này !', HttpStatus.CONFLICT)
      }

      const review = new this.reviewModel({
        ...createReviewDTO,
        product: product,
        updated_token: generateUpdateToken(),
        created_by: user,
      })

      await review.save()

      await orders[0].updateOne({ status: OrderStatus.COMPLETED })
      await user.updateOne({amount_spent: orders[0].payment.amount})

      return plainToInstance(ReviewDTO, review, {
        excludeExtraneousValues: true,
      })
    } catch (err) {
      if (err instanceof HttpException) {
        throw err
      } else throw new HttpException('Lỗi mạng', HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }

  async update(reviewid: string, updateReviewDTO: UpdateReviewDTO, userid: string) {
    try {
      const user = await this.userModel.findOne({ _id: userid })
      const review = await this.reviewModel.findOne({ _id: reviewid })

      if (!user) {
        throw new HttpException('Không tìm thấy người dùng !', HttpStatus.NOT_FOUND)
      }

      if (!review) {
        throw new HttpException('Không tìm thấy đánh giá !', HttpStatus.NOT_FOUND)
      }

      if (review.updated_token !== updateReviewDTO.updated_token) {
        throw new HttpException('Đánh giá đang được chỉnh sửa bởi ai đó !', HttpStatus.CONFLICT)
      }

      const updateReviewData = {
        ...updateReviewDTO,
        updated_token: generateUpdateToken(),
        updated_by: user,
        updated_date: Date.now(),
      }

      const updateResult = await review.updateOne(updateReviewData)

      if (updateResult.modifiedCount > 0) {
        return { message: 'Cập nhật thành công !' }
      } else {
        throw new HttpException('Cập nhật thất bại !', HttpStatus.NOT_IMPLEMENTED)
      }
    } catch (err) {
      if (err instanceof HttpException) {
        throw err
      } else {
        throw new HttpException('Lỗi mạng', HttpStatus.INTERNAL_SERVER_ERROR)
      }
    }
  }

  async getAll(page?: number, limit?: number, isAdmin?: boolean, product?: string): Promise<PaginatedReview> {
    const query = {
      ...(isAdmin ? {} : { is_actived: true, product: product }),
    }

    const reviews = await this.reviewModel
      .find(query)
      .populate('created_by')
      .populate('product')
      .skip((page - 1) * limit)
      .limit(limit)

    const totalCount = reviews.length

    const totalPage = Math.ceil(totalCount / limit)

    return {
      data: plainToInstance(ReviewDTO, reviews, {
        excludeExtraneousValues: true,
        enableImplicitConversion: true,
      }),
      page,
      limit,
      totalCount,
      totalPage,
    }
  }
}
