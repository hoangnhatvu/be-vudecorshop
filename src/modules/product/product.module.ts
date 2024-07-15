import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { categorySchema } from '../../models/category.schema'
import { userSchema } from '../../models/user.schema'
import { ConfigModule } from '@nestjs/config'
import { BlackListModule } from '../black-list/black-list.module'
import { productSchema } from '../../models/product.schema'
import { ProductService } from './product.service'
import { ProductController } from './product.controller'
import { optionSchema } from '../../models/option.schema'
import { CloudinaryService } from '../../common/uploadImage'
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Product', schema: productSchema },
      { name: 'Category', schema: categorySchema },
      { name: 'User', schema: userSchema },
      { name: 'Option', schema: optionSchema },
    ]),
    ConfigModule,
    BlackListModule,
  ],
  controllers: [ProductController],
  providers: [ProductService, CloudinaryService],
})
export class ProductModule {}
