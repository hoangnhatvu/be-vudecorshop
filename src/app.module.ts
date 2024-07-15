import { Module } from '@nestjs/common'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { MongooseModule } from '@nestjs/mongoose'
import { CategoryModule } from './modules/category/category.module'
import { UserModule } from './modules/user/user.module'
import { ConfigModule } from '@nestjs/config'
import { AuthModule } from './auth/auth.module'
import { ProductModule } from './modules/product/product.module'
import { OrderModule } from './modules/order/order.module'
import { ServeStaticModule } from '@nestjs/serve-static'
import { join } from 'path'
import { OptionModule } from './modules/option/option.module'
import { ReviewModule } from './modules/review/review.module'
import { AdminModule } from './modules/admin/admin.module'
import { TemplateModule } from './modules/template/template.module'

@Module({
  imports: [
    ConfigModule.forRoot(),
    MongooseModule.forRoot('mongodb+srv://hoangnhatvu35202:Vu586039@cluster0.e6rlg4q.mongodb.net/vushop'),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..'),
    }),
    CategoryModule,
    UserModule,
    AuthModule,
    ProductModule,
    OrderModule,
    OptionModule,
    ReviewModule,
    AdminModule,
    TemplateModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
