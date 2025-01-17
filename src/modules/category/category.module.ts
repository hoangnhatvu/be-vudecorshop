import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { categorySchema } from '../../models/category.schema';
import { CategoryService } from './category.service';
import { CategoryController } from './category.controller';
import { userSchema } from '../../models/user.schema';
import { ConfigModule } from '@nestjs/config';
import { BlackListModule } from '../black-list/black-list.module';
import { CloudinaryService } from '../../common/uploadImage';
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Category', schema: categorySchema },
      { name: 'User', schema: userSchema },
    ]),
    ConfigModule,
    BlackListModule,
  ],
  controllers: [CategoryController],
  providers: [CategoryService, CloudinaryService],
})
export class CategoryModule {}
