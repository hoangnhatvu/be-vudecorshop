import { IsBoolean, IsNotEmpty, IsNumber, IsOptional, Max, Min } from 'class-validator'
import { Expose, Transform, Type } from 'class-transformer'
import { BooleanPipe } from 'src/pipes/boolean.pipe'
import { MetaDataDTO } from './meta-data.dto'
import { ProductInfoDTO } from './product.dto'

export class ReviewDTO extends MetaDataDTO {
  @Expose()
  id: string

  @Expose()
  @Type(() => ProductInfoDTO)
  product: ProductInfoDTO

  @Expose()
  rate: number

  @Expose()
  content: string

  @Expose()
  num_update: number

  @Expose()
  is_actived: boolean
}

export class CreateReviewDTO {
  @IsNotEmpty()
  product: string

  @IsNotEmpty()
  order: string

  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number)
  @Min(0)
  @Max(5)
  rate: number

  @IsOptional()
  content: string
}

export class UpdateReviewDTO {
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(0)
  @Max(5)
  rate: number

  @IsOptional()
  content: string

  @IsOptional()
  @IsBoolean()
  @Transform((value) => new BooleanPipe().transform(value.value))
  is_actived: boolean

  @IsNotEmpty()
  updated_token: string
}
