import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { userSchema } from '../../models/user.schema'
import { ConfigModule } from '@nestjs/config'
import { BlackListModule } from '../black-list/black-list.module'
import { TemplateController } from './template.controller'
import { TemplateService } from './template.service'
import { templateSchema } from '../../models/template.schema'
import { CloudinaryService } from '../../common/uploadImage'
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Template', schema: templateSchema },
      { name: 'User', schema: userSchema },
    ]),
    ConfigModule,
    BlackListModule,
  ],
  controllers: [TemplateController],
  providers: [TemplateService, CloudinaryService],
})
export class TemplateModule {}
