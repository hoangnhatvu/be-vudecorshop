import * as mongoose from 'mongoose';

const sliderSchema = new mongoose.Schema({
  slider_image: {
    type: String,
    require: true
  },

  description: {
    type: String,
    require: true
  },

  is_active: {
    type: Boolean,
    default: true,
  },

  created_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },

  created_date: {
    type: Date,
    default: Date.now,
  },

  updated_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },

  updated_date: Date,

  updated_token: String,

  is_deleted: {
    type: Boolean,
    default: false,
  },
});

const Slider = mongoose.model('Slider', sliderSchema);

module.exports = Slider;
