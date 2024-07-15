import {
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  Min,
} from 'class-validator'
import { Expose, Transform, Type } from 'class-transformer'
import { CategoryInfoDTO } from './category.dto'
import { BooleanPipe } from 'src/pipes/boolean.pipe'
import { MetaDataDTO } from './meta-data.dto'
import { OptionDTO } from './option.dto'

export class ProductDTO extends MetaDataDTO {
  @Expose()
  id: string

  @Expose()
  @Type(() => CategoryInfoDTO)
  category: CategoryInfoDTO

  @Expose()
  product_name: string

  @Expose()
  product_image: string

  @Expose()
  product_3d: string

  @Expose()
  view_number: number

  @Expose()
  order_number: number

  @Expose()
  description: string
  
  @Expose()
  temp_price: number

  @Expose()
  @Type(() => OptionDTO)
  options: OptionDTO[]

  @Expose()
  is_actived: boolean

  @Expose()
  deleted_at: Date

  @Expose()
  updated_token: string
}

export class ProductInfoDTO {
  @Expose()
  id: string

  @Expose()
  @Type(() => CategoryInfoDTO)
  category: CategoryInfoDTO

  @Expose()
  product_name: string

  @Expose()
  product_image: string
}

export class CreateProductDTO {
  @IsNotEmpty()
  category: string

  @IsNotEmpty()
  product_name: string

  @IsOptional()
  description: string

  @IsNotEmpty()
  @IsArray()
  options: string[]

  @IsNotEmpty()
  @IsBoolean()
  @Transform((value) => new BooleanPipe().transform(value.value))
  is_actived: boolean
}

export class UpdateProductDTO {
  @IsNotEmpty()
  category: string

  @IsNotEmpty()
  product_name: string

  @IsOptional()
  description: string

  @IsNotEmpty()
  @IsArray()
  options: string[]

  @IsNotEmpty()
  @IsBoolean()
  @Transform((value) => new BooleanPipe().transform(value.value))
  is_actived: boolean

  @IsNotEmpty()
  updated_token: string
}

export class FilterProductDTO {
  @IsOptional()
  searchText: string

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(0)
  minPrice: number

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(0)
  maxPrice: number

  @IsOptional()
  @IsArray()
  selectedCategories: string[]

  @IsOptional()
  optionSort: string

  @IsOptional()
  @IsBoolean()
  @Transform((value) => new BooleanPipe().transform(value.value))
  is_actived: boolean
}
