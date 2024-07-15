import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { userSchema } from 'src/models/user.schema'
import { ConfigModule } from '@nestjs/config'
import { BlackListModule } from '../black-list/black-list.module'
import { optionSchema } from 'src/models/option.schema'
import { productSchema } from 'src/models/product.schema'
import { OptionController } from './option.controller'
import { OptionService } from './option.service'
import { CloudinaryService } from 'src/common/uploadImage'
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Option', schema: optionSchema },
      { name: 'User', schema: userSchema },
      { name: 'Product', schema: productSchema },
    ]),
    ConfigModule,
    BlackListModule,
  ],
  controllers: [OptionController],
  providers: [OptionService, CloudinaryService],
})
export class OptionModule {}
