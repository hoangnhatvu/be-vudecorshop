import { Injectable, ConflictException, InternalServerErrorException, HttpException, HttpStatus } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { generateUpdateToken } from 'src/common/generate-update-token'
import { plainToInstance } from 'class-transformer'
import { CreateUserDto, UpdateUserDTO, UpdateUserForAdminDTO, UserDTO, UserForAdminDTO } from 'src/dtos/user.dto'
import { User } from 'src/types/user'
import { hashPassword } from 'src/common/hashPassword'
import { deleteImage } from 'src/common/deleteImage'
import { UserRole } from 'src/enums/role.enum'

export interface PaginatedUser {
  data: UserForAdminDTO[]
  page: number
  limit: number
  totalCount: number
  totalPage: number
}
@Injectable()
export class UserService {
  constructor(@InjectModel('User') private userModel: Model<User>) {}

  async create(createUserDto: CreateUserDto): Promise<CreateUserDto> {
    try {
      const hashPass = await hashPassword(createUserDto.password)
      const user = new this.userModel({
        ...createUserDto,
        updated_token: generateUpdateToken(),
        password: hashPass,
      })

      await user.save()

      return plainToInstance(UserDTO, user, {
        excludeExtraneousValues: true,
      })
    } catch (err) {
      if (err.code === 11000) {
        throw new ConflictException('Email already exists !')
      } else {
        throw new InternalServerErrorException()
      }
    }
  }

  async update(userid: string, updateUserDTO: UpdateUserDTO, newImage: string) {
    try {
      const user = await this.userModel.findOne({ _id: userid })

      if (!user) {
        throw new HttpException('Không tìm thấy user', HttpStatus.NOT_FOUND)
      }

      if (user.updated_token !== updateUserDTO.updated_token) {
        throw new HttpException('User đang được cập nhật bởi ai đó!', HttpStatus.CONFLICT)
      }

      if (updateUserDTO?.ship_infos) {
        if (updateUserDTO?.ship_infos.length > 10) {
          throw new HttpException('Chỉ được lưu tối đa 10 địa chỉ !', HttpStatus.NOT_ACCEPTABLE)
        }
        const numIsDefault = updateUserDTO?.ship_infos.filter((info) => info.is_default === true).length
        if (numIsDefault > 1) {
          throw new HttpException('Chỉ được phép có một địa chỉ mặc định !', HttpStatus.NOT_ACCEPTABLE)
        }
      }

      const oldImage = user.user_image

      const updateUserData = {
        ...updateUserDTO,
        updated_token: generateUpdateToken(),
        user_image: newImage ? newImage : oldImage,
        updated_date: Date.now(),
      }

      if (user.is_blocked) {
        throw new HttpException('User đã bị chặn', HttpStatus.CONFLICT)
      } else {
        const updateResult = await user.updateOne(updateUserData)

        if (updateResult.modifiedCount > 0) {
          return { message: 'Cập nhật thành công' }
        } else {
          throw new HttpException('Cập nhật thất bại', HttpStatus.NOT_IMPLEMENTED)
        }
      }
    } catch (err) {
      if (err instanceof HttpException) {
        throw err
      } else {
        throw new HttpException('Lỗi Internet', HttpStatus.INTERNAL_SERVER_ERROR)
      }
    }
  }

  async updateForAdmin(userid: string, updateUserForAdminDTO: UpdateUserForAdminDTO, role: string) {
    try {
      const user = await this.userModel.findOne({ _id: userid })

      if (!user) {
        throw new HttpException('Không tìm thấy user !', HttpStatus.NOT_FOUND)
      } else if (role !== UserRole.ADMIN && updateUserForAdminDTO?.role) {
        throw new HttpException('Không có quyền chỉnh sửa !', HttpStatus.FORBIDDEN)
      }

      if (user.updated_token !== updateUserForAdminDTO.updated_token) {
        throw new HttpException('User đang được cập nhật bởi ai đó !', HttpStatus.CONFLICT)
      }

      const updateUserData = {
        ...updateUserForAdminDTO,
        updated_token: generateUpdateToken(),
        updated_date: Date.now(),
      }

      const updateResult = await user.updateOne(updateUserData)

      if (updateResult.modifiedCount > 0) {
        return { message: 'Cập nhật thành công' }
      } else {
        throw new HttpException('Cập nhật thất bại', HttpStatus.NOT_IMPLEMENTED)
      }
    } catch (err) {
      if (err instanceof HttpException) {
        throw err
      } else {
        throw new HttpException('Lỗi Internet', HttpStatus.INTERNAL_SERVER_ERROR)
      }
    }
  }

  async getUser(userid: string): Promise<UserDTO> {
    try {
      const user = await this.userModel.findOne({ _id: userid })

      if (!user) {
        throw new HttpException('Không tìm thấy user', HttpStatus.NOT_FOUND)
      } else {
        return plainToInstance(UserDTO, user, {
          excludeExtraneousValues: true,
          enableImplicitConversion: true,
        })
      }
    } catch (err) {
      if (err instanceof HttpException) {
        throw err
      } else {
        throw new HttpException('Lỗi Internet', HttpStatus.INTERNAL_SERVER_ERROR)
      }
    }
  }

  async getAllUsers(page?: number, limit?: number): Promise<PaginatedUser> {
    try {
      const users = await this.userModel
        .find()
        .skip((page - 1) * limit)
        .limit(limit)

      const totalCount = users.length

      const totalPage = Math.ceil(totalCount / limit)

      return {
        data: plainToInstance(UserForAdminDTO, users, {
          excludeExtraneousValues: true,
          enableImplicitConversion: true,
        }),
        page,
        limit,
        totalCount,
        totalPage,
      }
    } catch (err) {
      if (err instanceof HttpException) {
        throw err
      } else {
        throw new HttpException('Lỗi Internet', HttpStatus.INTERNAL_SERVER_ERROR)
      }
    }
  }
}
