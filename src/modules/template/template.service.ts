import { HttpException, HttpStatus, Injectable, BadRequestException } from '@nestjs/common'
import { generateUpdateToken } from 'src/common/generate-update-token'
import { plainToInstance } from 'class-transformer'
import { Model } from 'mongoose'
import { InjectModel } from '@nestjs/mongoose'
import { User } from 'src/types/user'
import { Template } from 'src/types/template'
import { CreateTemplateDTO, FilterTemplateDTO, TemplateDTO } from 'src/dtos/template.dto'

export interface PaginatedTemplate {
  data: TemplateDTO[]
  page: number
  limit: number
  totalCount: number
  totalPage: number
}

@Injectable()
export class TemplateService {
  constructor(
    @InjectModel('Template') private templateModel: Model<Template>,
    @InjectModel('User') private userModel: Model<User>,
  ) {}

  async create(createTemplateDTO: CreateTemplateDTO, userid: string, templateImage: string): Promise<TemplateDTO> {
    try {
      const user = await this.userModel.findOne({ _id: userid })

      if (!user) {
        throw new HttpException('Không tìm thấy người dùng !', HttpStatus.NOT_FOUND)
      }

      const template = new this.templateModel({
        ...createTemplateDTO,
        products: createTemplateDTO.products.map((item) => ({
          product: item.product,
          option: item.option,
          quantity: item.quantity,
        })),
        updated_token: generateUpdateToken(),
        template_image: templateImage,
        created_by: user,
      })

      await template.save()

      return plainToInstance(TemplateDTO, template, {
        excludeExtraneousValues: true,
      })
    } catch (err) {
      if (err instanceof HttpException) {
        throw err
      } else {
        console.log(err)
        throw new HttpException('Lỗi server !', HttpStatus.INTERNAL_SERVER_ERROR)
      }
    }
  }

  // async update(orderId: string, updateOrderDTO: UpdateOrderDTO, userid: string) {
  //   try {
  //     const user = await this.userModel.findOne({ _id: userid })
  //     const order = await this.orderModel
  //       .findOne({
  //         _id: orderId,
  //       })
  //       .populate('products.product')
  //       .populate('products.option')

  //     if (!user) {
  //       throw new HttpException('Không tìm thấy user', HttpStatus.NOT_FOUND)
  //     }

  //     if (!order) {
  //       throw new HttpException('Không tìm thấy đơn hàng', HttpStatus.NOT_FOUND)
  //     }

  //     if (order.updated_token !== updateOrderDTO.updated_token) {
  //       throw new HttpException('Đơn hàng đang được cập nhật bởi một ai đó', HttpStatus.CONFLICT)
  //     }

  //     if (order.status === OrderStatus.PENDING && updateOrderDTO.status === OrderStatus.BEING_PICKED_UP) {
  //       const listProducts = order.products.map((item: any) => {
  //         return { name: item.product.product_name, quantity: item.quantity, weight: 1000 }
  //       })
  //       const data = {
  //         to_name: order.customer_name,
  //         to_phone: order.phone_number,
  //         to_address: order.address,
  //         to_ward_code: order.ward,
  //         to_district_id: order.district,
  //         cod_amount: order.payment.amount,
  //         items: listProducts,
  //       }

  //       const responseData = await createOrder(data)
  //       await order.updateOne({ order_code_ship: responseData.data.order_code })
  //     }

  //     if (updateOrderDTO.status === OrderStatus.CANCELED) {
  //       for (const item of order.products) {
  //         const option = await this.optionModel.findOne({ _id: item.option.id })
  //         if (option) {
  //           await option.updateOne({ stock: option.stock + item.quantity })
  //         }
  //       }
  //     }

  //     if (updateOrderDTO.status === OrderStatus.IN_RATING) {
  //       for (const item of order.products) {
  //         const product = await this.productModel.findOne({ _id: item.product.id })
  //         if (product) {
  //           await product.updateOne({ order_number: product.order_number + item.quantity })
  //           await order.updateOne({ payment: { ...order.payment, status: PaymentStatus.PAID } })
  //         }
  //       }
  //     }

  //     if (order.status === OrderStatus.BEING_PICKED_UP && updateOrderDTO.status === OrderStatus.CANCELED) {
  //       await cancelOrder(order.order_code_ship)
  //     }

  //     const updateOrdertData = {
  //       ...updateOrderDTO,
  //       updated_token: generateUpdateToken(),
  //       updated_by: user,
  //       updated_date: Date.now(),
  //     }

  //     const updateResult = await order.updateOne(updateOrdertData)

  //     if (updateResult.modifiedCount > 0) {
  //       return { message: 'Cập nhật thành công !' }
  //     } else {
  //       throw new HttpException('Cập nhật thất bại !', HttpStatus.NOT_IMPLEMENTED)
  //     }
  //   } catch (err) {
  //     if (err instanceof HttpException) {
  //       throw err
  //     } else {
  //       throw new HttpException('Lỗi mạng !', HttpStatus.INTERNAL_SERVER_ERROR)
  //     }
  //   }
  // }

  async getAll(
    page: number,
    limit: number,
    isAdmin: boolean,
    filterTemplateDTO: FilterTemplateDTO,
  ): Promise<PaginatedTemplate> {
    try {
      const query: any = {
        deleted_at: null,
        ...(isAdmin ? {} : { is_actived: true }),
      }

      if (filterTemplateDTO) {
        if (filterTemplateDTO.searchText) {
          query.$or = [
            { template_name: { $regex: new RegExp(filterTemplateDTO.searchText, 'i') } },
            { description: { $regex: new RegExp(filterTemplateDTO.searchText, 'i') } },
          ]
        }

        if (isAdmin && filterTemplateDTO.is_actived !== undefined) {
          query.is_actived = filterTemplateDTO.is_actived
        }
      }
      let sort = {}

      switch (filterTemplateDTO.optionSort) {
        case 'popular':
          sort = { view_number: 1 }
          break
        default:
          sort = { created_date: -1 }
          break
      }

      const templates = await this.templateModel
        .find(query)
        .populate('created_by')
        .populate('updated_by')
        .populate('products.product')
        .populate('products.option')
        .sort({ ...sort } as any)
        .skip((page - 1) * limit)
        .limit(limit)

      const totalCount = (await this.templateModel.find(query)).length

      const totalPage = Math.ceil(totalCount / limit)

      return {
        data: plainToInstance(TemplateDTO, templates, {
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

  //   const ordersList = await this.orderModel
  //     .find(status ? { status } : {})
  //     .sort({ created_date: -1 })
  //     .populate('products.product')
  //     .populate('products.option')
  //     .populate('created_by')
  //     .populate('user')

  //   const totalCount = (await this.orderModel.find(status ? { status } : {})).length

  //   const totalPage = Math.ceil(totalCount / limit)

  //   return {
  //     data: plainToInstance(OrderDTO, ordersList, {
  //       excludeExtraneousValues: true,
  //       enableImplicitConversion: true,
  //     }),
  //     page,
  //     limit,
  //     totalCount,
  //     totalPage,
  //   }
  // }

  // async getOrderByUser(page?: number, limit?: number, userid?: string, status?: string): Promise<PaginatedOrder> {
  //   const orders = await this.orderModel
  //     .find({
  //       user: userid,
  //       status: status === OrderStatus.IN_RATING ? { $in: [OrderStatus.IN_RATING, OrderStatus.COMPLETED] } : status,
  //     })
  //     .populate('products.product')
  //     .populate('products.option')
  //     .populate('created_by')
  //     .populate('user')

  //   const totalCount = orders.length

  //   const totalPage = Math.ceil(totalCount / limit)

  //   return {
  //     data: plainToInstance(OrderDTO, orders, {
  //       excludeExtraneousValues: true,
  //       enableImplicitConversion: true,
  //     }),
  //     page,
  //     limit,
  //     totalCount,
  //     totalPage,
  //   }
  // }
}
