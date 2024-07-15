import {
  Controller,
  Post,
  Body,
  Put,
  UseGuards,
  UseInterceptors,
  Query,
  UploadedFile,
  Req,
  BadRequestException,
  Get,
  HttpCode,
  HttpException,
  HttpStatus,
} from '@nestjs/common'
import { UserService } from './user.service'
import { CreateUserDto, UpdateUserDTO, UpdateUserForAdminDTO } from '../../dtos/user.dto'
import { AuthGuard } from '../../guards/auth.guard'
import { Roles } from '../../decorators/roles.decorator'
import { UserRole } from '../../enums/role.enum'
import { FileInterceptor } from '@nestjs/platform-express'
import { fileFilter } from '../../common/fileFilter'
import { CloudinaryService } from '../../common/uploadImage'
@Controller('users')
export class UserController {
  constructor(
    private userService: UserService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}
  @Post('create')
  create(@Body() userCreate: CreateUserDto) {
    return this.userService.create(userCreate)
  }

  @Post('getUser')
  @UseGuards(AuthGuard)
  @Roles(UserRole.ADMIN, UserRole.EMPLOYEE, UserRole.USER)
  getUser(@Body() body: { id: string }, @Req() req: any) {
    return this.userService.getUser(body.id ? body.id : req.user_data.id)
  }

  @Put('update')
  @UseGuards(AuthGuard)
  @Roles(UserRole.USER, UserRole.ADMIN, UserRole.EMPLOYEE)
  @UseInterceptors(
    FileInterceptor('user_image', {
      fileFilter,
    }),
  )
  async update(@UploadedFile() file: Express.Multer.File, @Body() updateUserDTO: UpdateUserDTO, @Req() req: any) {
    if (req.fileValidationError) {
      throw new BadRequestException(req.fileValidationError)
    }

    try {
      const result_image = file ? await this.cloudinaryService.uploadImage(file.path) : null

      return this.userService.update(req.user_data.id, updateUserDTO, file ? result_image?.secure_url : null)
    } catch (error) {
      console.log(error)
      throw new HttpException('Upload ảnh thất bại !', HttpStatus.BAD_REQUEST)
    } 
  }

  @Put('updateUserForAdmin')
  @UseGuards(AuthGuard)
  @Roles(UserRole.ADMIN, UserRole.EMPLOYEE)
  updateForAdmin(@Query() query: { id: string }, @Body() updateUserForAdmin: UpdateUserForAdminDTO, @Req() req: any) {
    return this.userService.updateForAdmin(query.id, updateUserForAdmin, req.user_data.role)
  }

  @Get()
  @UseGuards(AuthGuard)
  @Roles(UserRole.ADMIN, UserRole.EMPLOYEE)
  @HttpCode(200)
  async getAllUsers(@Query() query: any) {
    const page = query.page ? Number(query.page) : 1
    const limit = query.limit ? Number(query.limit) : 20
    return this.userService.getAllUsers(page, limit)
  }
}
