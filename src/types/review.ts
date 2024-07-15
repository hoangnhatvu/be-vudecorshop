import { MetaData } from './meta-data';
import { Product } from './product';

export interface Review extends MetaData {
  id: string
  product: Product
  rate: number
  content: string
  num_update: number
  is_actived: boolean
}
