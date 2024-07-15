import * as mongoose from 'mongoose'
import { baseSchema } from './base.schema'

export const templateSchema = new mongoose.Schema({
  template_name: {
    type: String,
    required: true,
  },

  template_image: {
    type: String,
    required: true,
  },

  description: {
    type: String,
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

  view_number: {
    type: Number,
    default: 0,
  },

  is_actived: {
    type: Boolean,
    default: true,
  },

  deleted_at: Date,

  ...baseSchema.obj,
})
