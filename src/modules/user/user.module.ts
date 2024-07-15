import { Module } from '@nestjs/common'
import { UserController } from './user.controller'
import { UserService } from './user.service'
import { MongooseModule } from '@nestjs/mongoose'
import { userSchema } from 'src/models/user.schema'
import { BlackListModule } from '../black-list/black-list.module'
import { ConfigModule } from '@nestjs/config'
import { CloudinaryService } from 'src/common/uploadImage'

@Module({
  imports: [MongooseModule.forFeature([{ name: 'User', schema: userSchema }]), ConfigModule, BlackListModule],
  controllers: [UserController],
  providers: [UserService, CloudinaryService],
})
export class UserModule {}
