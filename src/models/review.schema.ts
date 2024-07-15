import * as mongoose from 'mongoose'
import { baseSchema } from './base.schema'

export const reviewSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },

  rate: {
    type: Number,
    required: true,
  },

  content: {
    type: String,
    default: '',
  },

  num_update: {
    type: Number,
    default: 0,
  },

  is_actived: {
    type: Boolean,
    default: false,
  },

  ...baseSchema.obj,
})