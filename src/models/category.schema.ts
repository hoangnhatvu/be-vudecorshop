import * as mongoose from 'mongoose';
import { baseSchema } from './base.schema';

export const categorySchema = new mongoose.Schema({
  category_name: {
    type: String,
    required: true,
  },

  category_image: String,

  is_actived: {
    type: Boolean,
    default: true,
  },

  ...baseSchema.obj,
});
