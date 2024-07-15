import * as mongoose from 'mongoose'
import { Gender } from 'src/enums/gender.enum'
import { UserRole } from 'src/enums/role.enum'

export const userSchema = new mongoose.Schema({
  user_name: {
    type: String,
    required: true,
  },

  user_image: {
    type: String,
    default: '',
  },

  email: {
    type: String,
    required: true,
    unique: true,
  },

  password: {
    type: String,
    required: true,
  },

  role: {
    type: String,
    enum: UserRole,
    default: UserRole.USER,
  },

  birth_date: {
    type: Date,
    default: null,
    get: function (val: Date) {
      return val ? val.toISOString().split('T')[0] : null
    },
  },

  gender: {
    type: String,
    default: '',
  },

  amount_spent: {
    type: Number,
    default: 0,
  },

  is_active: {
    type: Boolean,
    default: false,
  },

  is_blocked: {
    type: Boolean,
    default: false,
  },

  ship_infos: [
    {
      customer_name: {
        type: String,
        default: '',
      },

      phone_number: {
        type: String,
        default: '',
      },

      province: {
        type: Number,
        default: '',
      },

      district: {
        type: Number,
        default: '',
      },

      ward: {
        type: String,
        default: '',
      },

      address: {
        type: String,
        default: '',
      },

      is_default: {
        type: Boolean,
        default: false,
      },
    },
  ],

  refresh_token: {
    type: String,
    default: null,
  },

  created_date: {
    type: Date,
    default: Date.now,
  },

  updated_date: {
    type: Date,
    default: '',
  },

  updated_token: {
    type: String,
    default: '',
  },

  device_token: {
    type: String,
    default: ''
  }
})

userSchema.path('ship_infos').validate(function (value) {
  return value.length <= 10
}, 'Không được phép lưu quá 10 địa chỉ!')
