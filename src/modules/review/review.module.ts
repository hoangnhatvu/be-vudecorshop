import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { userSchema } from 'src/models/user.schema';
import { ConfigModule } from '@nestjs/config';
import { BlackListModule } from '../black-list/black-list.module';
import { productSchema } from 'src/models/product.schema';
import { reviewSchema } from 'src/models/review.schema';
import { ReviewController } from './review.controller';
import { ReviewService } from './review.service';
import { orderSchema } from 'src/models/order.schema';
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Product', schema: productSchema },
      { name: 'Review', schema: reviewSchema },
      { name: 'User', schema: userSchema },
      { name: 'Order', schema: orderSchema },
    ]),
    ConfigModule,
    BlackListModule,
  ],
  controllers: [ReviewController],
  providers: [ReviewService],
})
export class ReviewModule {}
