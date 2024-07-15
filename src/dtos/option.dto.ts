import { Expose, Transform, Type } from 'class-transformer'
import { IsBoolean, IsNotEmpty, IsNumber, IsOptional, Max, Min } from 'class-validator'
import { BooleanPipe } from 'src/pipes/boolean.pipe'

export class OptionDTO {
  @Expose()
  id: string

  @Expose()
  option_image: string

  @Expose()
  size: string

  @Expose()
  color: string

  @Expose()
  price: number

  @Expose()
  discount_rate: number

  @Expose()
  stock: number

  @Expose()
  is_actived: boolean

  @Expose()
  updated_token: string
}

export class CreateOptionDTO {
  @IsOptional()
  option_image: string

  @IsOptional()
  size: string

  @IsOptional()
  color: string

  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number)
  @Min(0)
  price: number

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(0)
  @Max(100)
  discount_rate: number

  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number)
  @Min(0)
  stock: number

  @IsOptional()
  @IsBoolean()
  @Transform((value) => new BooleanPipe().transform(value.value))
  is_actived: boolean
}

export class UpdateOptionDTO {
  @IsNotEmpty()
  product: string

  @IsOptional()
  option_image: string

  @IsOptional()
  size: string

  @IsOptional()
  color: string

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(0)
  price: number

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(0)
  @Max(100)
  discount_rate: number

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(0)
  stock: number

  @IsOptional()
  @IsBoolean()
  @Transform((value) => new BooleanPipe().transform(value.value))
  is_actived: boolean

  @IsNotEmpty()
  updated_token: string
}
