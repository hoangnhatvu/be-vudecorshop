import { User } from './user'
import { Product } from './product'
import { MetaData } from './meta-data'
import { Option } from './option'

export interface Order extends MetaData {
  order_code_ship: string
  user: User
  products: [
    {
      product: Product
      option: Option
      quantity: number
    },
  ]
  customer_name: string
  phone_number: string
  district: number
  ward: string
  address: string
  status: string
  payment: {
    amount: number
    method: string
    status: string
  }
}
