import { User } from './user'
import { Product } from './product'
import { MetaData } from './meta-data'
import { Option } from './option'

export interface Template extends MetaData {
  template_name: string
  template_image: string
  description: string
  products: [
    {
      product: Product
      option: Option
      quantity: number
    },
  ]
  view_number: number
  is_actived: boolean
  deleted_at: Date
}
