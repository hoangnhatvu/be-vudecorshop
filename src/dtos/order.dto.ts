import { IsArray, IsBoolean, IsEnum, IsNotEmpty, IsNumber, Min } from 'class-validator';
import { Expose, Transform, Type } from 'class-transformer';
import { UserInfoDTO } from './user.dto';
import { MetaDataDTO } from './meta-data.dto';
import { ProductInfoDTO } from './product.dto';
import { BooleanPipe } from 'src/pipes/boolean.pipe';
import { NoInferType } from '@nestjs/config';
import { OptionDTO } from './option.dto';
import { PaymentMethod } from 'src/enums/payment.enum';
import { OrderStatus } from 'src/enums/order.enum';

export class OrderItemDTO {
  @Expose()
  @Type(() => ProductInfoDTO)
  product: ProductInfoDTO;

  @Expose()
  @Type(() => OptionDTO)
  option: OptionDTO;

  @Expose()
  quantity: number;
}

export class CreateOrderItemDTO {
  @IsNotEmpty()
  product: string;

  @IsNotEmpty()
  option: string;

  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number)
  @Min(0)
  quantity: number;
}

export class PaymentDTO {
  @Expose()
  id: string;

  @Expose()
  amount: number;

  @Expose()
  method: string;

  @Expose()
  status: string;
}

export class CreatePaymentDTO {
  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number)
  @Min(0)
  amount: number;

  @IsNotEmpty()
  @IsEnum(PaymentMethod)
  method: PaymentMethod;
}
export class OrderDTO extends MetaDataDTO {
  @Expose()
  order_code_ship: string;

  @Expose()
  id: string;

  @Expose()
  @Type(() => UserInfoDTO)
  user: UserInfoDTO;

  @Expose()
  @Type(() => OrderItemDTO)
  products: OrderItemDTO[];

  @Expose()
  customer_name: string;

  @Expose()
  phone_number: string;

  @Expose()
  address: string;

  @Expose()
  status: string;

  @Expose()
  @Type(() => PaymentDTO)
  payment: PaymentDTO;
}

export class CreateOrderDTO {
  @IsNotEmpty()
  @IsArray()
  @Type(() => CreateOrderItemDTO)
  products: CreateOrderItemDTO[];

  @IsNotEmpty()
  customer_name: string;

  @IsNotEmpty()
  phone_number: string;

  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number)
  @Min(0)
  district: number;

  @IsNotEmpty()
  ward: string;

  @IsNotEmpty()
  address: string;

  @IsNotEmpty()
  @Type(() => CreatePaymentDTO)
  payment: CreatePaymentDTO;
}

export class UpdateOrderDTO {
  @IsNotEmpty()
  @IsEnum(OrderStatus)
  status: OrderStatus;

  @IsNotEmpty()
  updated_token: string;
}

export class GetOrderByUserDTO {
  @IsNotEmpty()
  @IsEnum(OrderStatus)
  status: OrderStatus;
}
