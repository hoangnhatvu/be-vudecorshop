import { Document } from 'mongoose'
export interface User extends Document {
  id: string
  user_name: string
  user_image: string
  email: string
  readonly password: string
  role: string
  birth_date: Date
  gender: string
  ship_infos: [
    {
      customer_name: string
      phone_number: string
      province: number
      district: number
      ward: string
      address: string
      is_default: boolean
    },
  ]
  is_active: boolean
  is_blocked: boolean
  refresh_token: string
  created_date: Date
  updated_date: Date
  updated_token: string
  device_token: string
}
