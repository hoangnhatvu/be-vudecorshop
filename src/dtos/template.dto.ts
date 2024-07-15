import { IsArray, IsBoolean, IsNotEmpty, IsNumber, IsOptional, Min } from 'class-validator'
import { Expose, Transform, Type } from 'class-transformer'
import { MetaDataDTO } from './meta-data.dto'
import { ProductInfoDTO } from './product.dto'
import { BooleanPipe } from 'src/pipes/boolean.pipe'
import { OptionDTO } from './option.dto'

export class TemplateItemDTO {
  @Expose()
  @Type(() => ProductInfoDTO)
  product: ProductInfoDTO

  @Expose()
  @Type(() => OptionDTO)
  option: OptionDTO

  @Expose()
  quantity: number
}

export class TemplateDTO extends MetaDataDTO {
  @Expose()
  template_name: string

  @Expose()
  template_image: string

  @Expose()
  description: string

  @Expose()
  @Type(() => TemplateItemDTO)
  products: TemplateItemDTO[]

  @Expose()
  view_number: number

  @Expose()
  deleted_at: Date

  @Expose()
  is_actived: boolean
}

export class CreateTemplateItemDTO {
  @IsNotEmpty()
  product: string

  @IsNotEmpty()
  option: string

  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number)
  @Min(0)
  quantity: number
}

export class CreateTemplateDTO {
  @IsNotEmpty()
  template_name: string

  @IsNotEmpty()
  description: string

  @IsNotEmpty()
  @IsBoolean()
  @Transform((value) => new BooleanPipe().transform(value.value))
  is_actived: boolean

  @IsNotEmpty()
  @IsArray()
  @Type(() => CreateTemplateItemDTO)
  products: CreateTemplateItemDTO[]
}

export class FilterTemplateDTO {
  @IsOptional()
  searchText: string

  @IsOptional()
  optionSort: string

  @IsOptional()
  @IsBoolean()
  @Transform((value) => new BooleanPipe().transform(value.value))
  is_actived: boolean
}
