import { HttpException, HttpStatus, Injectable, BadRequestException } from '@nestjs/common'
import { generateUpdateToken } from 'src/common/generate-update-token'
import { plainToInstance } from 'class-transformer'
import { Model } from 'mongoose'
import { InjectModel } from '@nestjs/mongoose'
import { User } from 'src/types/user'
import { Order } from 'src/types/order'
import { CreateOrderDTO, OrderDTO, UpdateOrderDTO } from 'src/dtos/order.dto'
import { Product } from 'src/types/product'
import { OrderStatus } from 'src/enums/order.enum'
import { Option } from 'src/types/option'
import { cancelOrder, createOrder } from 'src/helpers/GHNApis'
import { PaymentStatus } from 'src/enums/payment.enum'
import * as moment from 'moment'
import * as querystring from 'qs'
import * as crypto from 'crypto'
import { htmlContentPaymentFail, htmlContentPaymentSuccess } from 'src/common/htmlContent'

export interface PaginatedOrder {
  data: OrderDTO[]
  page: number
  limit: number
  totalCount: number
  totalPage: number
}

@Injectable()
export class OrderService {
  constructor(
    @InjectModel('Order') private orderModel: Model<Order>,
    @InjectModel('User') private userModel: Model<User>,
    @InjectModel('Product') private productModel: Model<Product>,
    @InjectModel('Option') private optionModel: Model<Option>,
  ) {}

  async create(createOrderDTO: CreateOrderDTO, userid: string): Promise<OrderDTO> {
    try {
      const user = await this.userModel.findOne({ _id: userid })
      if (!user) {
        throw new HttpException('Không tìm thấy người dùng !', HttpStatus.NOT_FOUND)
      }
      try {
        const order = new this.orderModel({
          ...createOrderDTO,
          user: user,
          products: createOrderDTO.products.map((item) => ({
            product: item.product,
            option: item.option,
            quantity: item.quantity,
          })),
          updated_token: generateUpdateToken(),
          created_by: user,
        })

        try {
          await order.save()
          for (const item of createOrderDTO.products) {
            const option = await this.optionModel.findOne({ _id: item.option })
            if (option) {
              await option.updateOne({ stock: option.stock - item.quantity })
            }
          }
        } catch (error) {
          throw new HttpException(error, HttpStatus.NOT_FOUND)
        }
        return plainToInstance(OrderDTO, order, {
          excludeExtraneousValues: true,
        })
      } catch (error) {
        throw new HttpException(error, HttpStatus.NOT_FOUND)
      }
    } catch (err) {
      if (err instanceof HttpException) {
        throw err
      } else throw new HttpException('Lỗi mạng !', HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }

  async update(orderId: string, updateOrderDTO: UpdateOrderDTO, userid: string) {
    try {
      const user = await this.userModel.findOne({ _id: userid })
      const order = await this.orderModel
        .findOne({
          _id: orderId,
        })
        .populate('products.product')
        .populate('products.option')

      if (!user) {
        throw new HttpException('Không tìm thấy user', HttpStatus.NOT_FOUND)
      }

      if (!order) {
        throw new HttpException('Không tìm thấy đơn hàng', HttpStatus.NOT_FOUND)
      }

      if (order.updated_token !== updateOrderDTO.updated_token) {
        throw new HttpException('Đơn hàng đang được cập nhật bởi một ai đó', HttpStatus.CONFLICT)
      }

      if (order.status === OrderStatus.PENDING && updateOrderDTO.status === OrderStatus.BEING_PICKED_UP) {
        const listProducts = order.products.map((item: any) => {
          return { name: item.product.product_name, quantity: item.quantity, weight: 1000 }
        })
        const data = {
          to_name: order.customer_name,
          to_phone: order.phone_number,
          to_address: order.address,
          to_ward_code: order.ward,
          to_district_id: order.district,
          cod_amount: order.payment.amount,
          items: listProducts,
        }

        const responseData = await createOrder(data)
        await order.updateOne({ order_code_ship: responseData.data.order_code })
      }

      if (updateOrderDTO.status === OrderStatus.CANCELED) {
        for (const item of order.products) {
          const option = await this.optionModel.findOne({ _id: item.option.id })
          if (option) {
            await option.updateOne({ stock: option.stock + item.quantity })
          }
        }
      }

      if (updateOrderDTO.status === OrderStatus.IN_RATING) {
        for (const item of order.products) {
          const product = await this.productModel.findOne({ _id: item.product.id })
          if (product) {
            await product.updateOne({ order_number: product.order_number + item.quantity })
            await order.updateOne({ payment: { ...order.payment, status: PaymentStatus.PAID } })
          }
        }
      }

      if (order.status === OrderStatus.BEING_PICKED_UP && updateOrderDTO.status === OrderStatus.CANCELED) {
        await cancelOrder(order.order_code_ship)
      }

      const updateOrdertData = {
        ...updateOrderDTO,
        updated_token: generateUpdateToken(),
        updated_by: user,
        updated_date: Date.now(),
      }

      const updateResult = await order.updateOne(updateOrdertData)

      if (updateResult.modifiedCount > 0) {
        return { message: 'Cập nhật thành công !' }
      } else {
        throw new HttpException('Cập nhật thất bại !', HttpStatus.NOT_IMPLEMENTED)
      }
    } catch (err) {
      if (err instanceof HttpException) {
        throw err
      } else {
        throw new HttpException('Lỗi mạng !', HttpStatus.INTERNAL_SERVER_ERROR)
      }
    }
  }

  async getAll(page: number, limit: number, status: string): Promise<PaginatedOrder> {
    const orders = await this.orderModel.find({
      status: OrderStatus.IN_RATING,
    })

    for (const order of orders) {
      if (Date.now() - order.updated_date.getTime() >= 3 * 24 * 60 * 60 * 1000) {
        await order.updateOne({ status: OrderStatus.COMPLETED })
      }
    }

    const ordersList = await this.orderModel
      .find(status !== "" ? { status } : {})
      .sort({ created_date: -1 })
      .populate('products.product')
      .populate('products.option')
      .populate('created_by')
      .populate('user')

    const totalCount = (await this.orderModel.find(status ? { status } : {})).length

    const totalPage = Math.ceil(totalCount / limit)

    return {
      data: plainToInstance(OrderDTO, ordersList, {
        excludeExtraneousValues: true,
        enableImplicitConversion: true,
      }),
      page,
      limit,
      totalCount,
      totalPage,
    }
  }

  async getOrderByUser(page?: number, limit?: number, userid?: string, status?: string): Promise<PaginatedOrder> {
    const orders = await this.orderModel
      .find({
        user: userid,
        status: status === OrderStatus.IN_RATING ? { $in: [OrderStatus.IN_RATING, OrderStatus.COMPLETED] } : status,
      })
      .populate('products.product')
      .populate('products.option')
      .populate('created_by')
      .populate('user')

    const totalCount = orders.length

    const totalPage = Math.ceil(totalCount / limit)

    return {
      data: plainToInstance(OrderDTO, orders, {
        excludeExtraneousValues: true,
        enableImplicitConversion: true,
      }),
      page,
      limit,
      totalCount,
      totalPage,
    }
  }

  sortObject(obj: any) {
    let sorted = {}
    let str = []
    let key
    for (key in obj) {
      if (obj.hasOwnProperty(key)) {
        str.push(encodeURIComponent(key))
      }
    }
    str.sort()
    for (key = 0; key < str.length; key++) {
      sorted[str[key]] = encodeURIComponent(obj[str[key]]).replace(/%20/g, '+')
    }
    return sorted
  }

  async createPayment(amount: number, orderId: string) {
    let vnpUrl = process.env.VNPAY_URL

    let vnp_Params = {}
    vnp_Params['vnp_Version'] = '2.1.0'
    vnp_Params['vnp_Command'] = 'pay'
    vnp_Params['vnp_TmnCode'] = process.env.VNP_TMNCODE
    vnp_Params['vnp_Locale'] = 'vn'
    vnp_Params['vnp_CurrCode'] = 'VND'
    vnp_Params['vnp_TxnRef'] = orderId
    vnp_Params['vnp_OrderInfo'] = 'Thanh toán cho đơn hàng'
    vnp_Params['vnp_OrderType'] = 'other'
    vnp_Params['vnp_Amount'] = amount * 100
    vnp_Params['vnp_ReturnUrl'] = 'http://192.168.61.103:3000/orders/getPaymentResult'
    vnp_Params['vnp_IpAddr'] = '127.0.0.1'
    vnp_Params['vnp_CreateDate'] = moment(new Date()).format('YYYYMMDDHHmmss')

    vnp_Params = this.sortObject(vnp_Params)
    var signData = querystring.stringify(vnp_Params, { encode: false })
    let hmac = crypto.createHmac('sha512', process.env.VNP_HASHSECRET)
    let signed = hmac.update(new Buffer(signData, 'utf-8')).digest('hex')
    vnp_Params['vnp_SecureHash'] = signed
    vnpUrl += '?' + querystring.stringify(vnp_Params, { encode: false })
    return vnpUrl
  }

  async getPaymentResult(query: any) {
    let vnp_Params = query
    let secureHash = vnp_Params['vnp_SecureHash']

    let orderId = vnp_Params['vnp_TxnRef']
    let rspCode = vnp_Params['vnp_ResponseCode']

    delete vnp_Params['vnp_SecureHash']
    delete vnp_Params['vnp_SecureHashType']

    vnp_Params = this.sortObject(vnp_Params)
    let secretKey = process.env.VNP_HASHSECRET
    let signData = querystring.stringify(vnp_Params, { encode: false })
    let hmac = crypto.createHmac('sha512', secretKey)
    let signed = hmac.update(new Buffer(signData, 'utf-8')).digest('hex')

    let paymentStatus = '0' // Giả sử '0' là trạng thái khởi tạo giao dịch, chưa có IPN. Trạng thái này được lưu khi yêu cầu thanh toán chuyển hướng sang Cổng thanh toán VNPAY tại đầu khởi tạo đơn hàng.
    //let paymentStatus = '1'; // Giả sử '1' là trạng thái thành công bạn cập nhật sau IPN được gọi và trả kết quả về nó
    //let paymentStatus = '2'; // Giả sử '2' là trạng thái thất bại bạn cập nhật sau IPN được gọi và trả kết quả về nó

    let checkOrderId = true // Mã đơn hàng "giá trị của vnp_TxnRef" VNPAY phản hồi tồn tại trong CSDL của bạn
    let checkAmount = true // Kiểm tra số tiền "giá trị của vnp_Amout/100" trùng khớp với số tiền của đơn hàng trong CSDL của bạn
    if (secureHash === signed) {
      //kiểm tra checksum
      if (checkOrderId) {
        if (checkAmount) {
          if (paymentStatus == '0') {
            //kiểm tra tình trạng giao dịch trước khi cập nhật tình trạng thanh toán
            if (rspCode == '00') {
              //thanh cong
              //paymentStatus = '1'
              // Ở đây cập nhật trạng thái giao dịch thanh toán thành công vào CSDL của bạn
              const order = await this.orderModel.findOne({
                _id: orderId,
              })
              if (order) {
                await order.updateOne({ payment: { ...order.payment, status: PaymentStatus.PAID } })
              }
              return htmlContentPaymentSuccess
            } else {
              //that bai
              //paymentStatus = '2'
              // Ở đây cập nhật trạng thái giao dịch thanh toán thất bại vào CSDL của bạn
              return htmlContentPaymentFail
            }
          } else {
            return htmlContentPaymentFail
          }
        } else {
          return htmlContentPaymentFail
        }
      } else {
        return htmlContentPaymentFail
      }
    } else {
      return htmlContentPaymentFail
    }
  }
}
