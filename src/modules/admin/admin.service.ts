import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import { Model } from 'mongoose'
import { InjectModel } from '@nestjs/mongoose'
import { User } from 'src/types/user'
import { Product } from 'src/types/product'
import { Order } from 'src/types/order'
import { OrderStatus } from 'src/enums/order.enum'

@Injectable()
export class AdminService {
  constructor(
    @InjectModel('Order') private orderModel: Model<Order>,
    @InjectModel('User') private userModel: Model<User>,
    @InjectModel('Product') private productModel: Model<Product>,
  ) {}

  async getInfoDashboard(startDate?: Date, endDate?: Date) {
    try {
      const totalUser = await this.userModel.find()
      const totalBlance = (await this.orderModel.find({ status: OrderStatus.COMPLETED })).reduce((total, item) => {
        return total + item.payment.amount
      }, 0)
      const totalProduct = await this.productModel.find()
      const totalOrderCompleted = await this.orderModel.find({ status: OrderStatus.COMPLETED })
      const top10Products = await this.productModel.find({ is_actived: true }).sort({ order_number: 1 }).limit(10)
      const top10Users = await this.userModel
        .find({ is_active: true, is_blocked: false })
        .sort({ amount_spent: 1 })
        .limit(10)
      const top3Categories = await this.orderModel.aggregate([
        { $unwind: '$products' },
        {
          $group: {
            _id: '$products.product.category',
            totalQuantity: { $sum: '$products.quantity' },
            count: { $sum: 1 },
          },
        },
        { $sort: { totalQuantity: -1 } },
        { $limit: 3 },
      ])

      return {
        totalUser: totalUser.length,
        totalBlance: totalBlance,
        totalProduct: totalProduct.length,
        totalOrderCompleted: totalOrderCompleted.length,
        top10Products: top10Products,
        top10Users: top10Users,
        top3Categories: top3Categories,
        // revenue,
      }
    } catch (err) {
      if (err instanceof HttpException) {
        throw err
      } else throw new HttpException('Lỗi server !', HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }
}
