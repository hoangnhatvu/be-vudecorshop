import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { userSchema } from 'src/models/user.schema';
import { ConfigModule } from '@nestjs/config';
import { BlackListModule } from '../black-list/black-list.module';

import { orderSchema } from 'src/models/order.schema';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { productSchema } from 'src/models/product.schema';
import { optionSchema } from 'src/models/option.schema';
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Order', schema: orderSchema },
      { name: 'User', schema: userSchema },
      { name: 'Product', schema: productSchema },
      { name: 'Option', schema: optionSchema }
    ]),
    ConfigModule,
    BlackListModule,
  ],
  controllers: [OrderController],
  providers: [OrderService],
})
export class OrderModule {}
