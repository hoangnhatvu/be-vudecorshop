import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { userSchema } from '../../models/user.schema'
import { ConfigModule } from '@nestjs/config'
import { BlackListModule } from '../black-list/black-list.module'
import { productSchema } from '../../models/product.schema'
import { orderSchema } from '../../models/order.schema'
import { AdminService } from './admin.service'
import { AdminController } from './admin.controller'
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Order', schema: orderSchema },
      { name: 'User', schema: userSchema },
      { name: 'Product', schema: productSchema },
    ]),
    ConfigModule,
    BlackListModule,
  ],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
