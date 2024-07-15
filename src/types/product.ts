import { Category } from './category'
import { MetaData } from './meta-data'
import { Option } from './option'

export interface Product extends MetaData {
  category: Category
  product_name: string
  product_image: string
  product_3d: string
  view_number: number
  order_number: number
  temp_price: number
  description: string
  options: Option[]
  is_actived: boolean
  deleted_at: Date
}
