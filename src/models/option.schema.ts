import * as mongoose from 'mongoose'

export const optionSchema = new mongoose.Schema({
  option_image: String,

  size: String,

  color: String,

  price: {
    type: Number,
    required: true,
  },

  discount_rate: {
    type: Number,
    default: 0,
  },

  stock: {
    type: Number,
    required: true,
  },

  is_actived: {
    type: Boolean,
    default: true,
  },

  updated_token: {
    type: String,
    required: true,
  }
})
