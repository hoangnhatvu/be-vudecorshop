import * as mongoose from 'mongoose'
import { OrderStatus } from 'src/enums/order.enum'
import { baseSchema } from './base.schema'
import { PaymentMethod, PaymentStatus } from 'src/enums/payment.enum'

export const orderSchema = new mongoose.Schema({
  order_code_ship: {
    type: String,
    default: ""
  },

  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },

  products: [
    {
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true,
      },
      option: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Option',
        required: true,
      },
      quantity: {
        type: Number,
        required: true,
      },
    },
  ],

  customer_name: {
    type: String,
    required: true,
  },

  phone_number: {
    type: String,
    required: true,
  },

  district: {
    type: Number,
    required: true,
  },

  ward: {
    type: String,
    required: true,
  },

  address: {
    type: String,
    required: true,
  },

  status: {
    type: String,
    enum: OrderStatus,
    default: OrderStatus.PENDING,
  },

  payment: {
    amount: {
      type: Number,
      required: true,
    },

    method: {
      type: String,
      enum: PaymentMethod,
      required: true,
    },

    status: {
      type: String,
      enum: PaymentStatus,
      default: PaymentStatus.UNPAID,
    },
  },

  ...baseSchema.obj,
})
