import { MetaData } from './meta-data';

export interface Category extends MetaData {
  id: string;
  category_name: string;
  category_image: string;
  is_actived: boolean;  
}
