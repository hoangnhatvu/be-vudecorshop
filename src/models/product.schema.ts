import * as mongoose from 'mongoose'
import { baseSchema } from './base.schema'

export const productSchema = new mongoose.Schema({
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true,
  },

  product_name: {
    type: String,
    required: true,
  },

  product_image: String,
  
  product_3d: String,

  view_number: {
    type: Number,
    default: 0,
  },

  order_number: {
    type: Number,
    default: 0,
  },

  description: {
    type: String,
    required: true,
  },

  temp_price: {
    type: Number,
    required: true,
  },

  options: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Option',
      required: true,
    },
  ],

  is_actived: {
    type: Boolean,
    default: true,
  },

  deleted_at: {
    type: Date,
    default: null,
  },

  ...baseSchema.obj,
})
