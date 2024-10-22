import {
  Body,
  Controller,
  Post,
  UseGuards,
  Req,
  BadRequestException,
  Put,
  Query,
  Get,
  UseInterceptors,
  UploadedFile,
  HttpException,
  HttpStatus,
  HttpCode,
} from '@nestjs/common'
import { UserRole } from '../../enums/role.enum'
import { AuthGuard } from '../../guards/auth.guard'
import { Roles } from '../../decorators/roles.decorator'
import { fileFilter } from '../../common/fileFilter'
import { TemplateService } from './template.service'
import { CloudinaryService } from '../../common/uploadImage'
import { FileInterceptor } from '@nestjs/platform-express'
import { CreateTemplateDTO, FilterTemplateDTO } from '../../dtos/template.dto'

@Controller('templates')
export class TemplateController {
  constructor(
    private templateService: TemplateService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}
  @Post('create')
  @UseGuards(AuthGuard)
  @Roles(UserRole.ADMIN, UserRole.EMPLOYEE)
  @UseInterceptors(
    FileInterceptor('template_image', {
      fileFilter,
    }),
  )
  async update(
    @UploadedFile() file: Express.Multer.File,
    @Body() createTemplateDTO: CreateTemplateDTO,
    @Req() req: any,
  ) {
    if (req.fileValidationError) {
      throw new BadRequestException(req.fileValidationError)
    }

    try {
      const result_image = await this.cloudinaryService.uploadImage(file)

      return this.templateService.create(createTemplateDTO, req.user_data.id, file ? result_image?.secure_url : null)
    } catch (error) {
      console.log(error)
      throw new HttpException('Upload ảnh thất bại !', HttpStatus.BAD_REQUEST)
    }
  }

  @Post('getAll')
  @HttpCode(200)
  async findTemplates(@Query() query, @Body() filterTemplateDTO: FilterTemplateDTO) {
    const page = query.page ? Number(query.page) : 1
    const limit = query.limit ? Number(query.limit) : 20
    return this.templateService.getAll(page, limit, false, filterTemplateDTO)
  }

  @Post('getAllForAdmin')
  @UseGuards(AuthGuard)
  @Roles(UserRole.ADMIN, UserRole.EMPLOYEE, UserRole.USER)
  @HttpCode(200)
  async getAll(@Query() query, @Body() filterTemplateDTO: FilterTemplateDTO) {
    const page = query.page ? Number(query.page) : 1
    const limit = query.limit ? Number(query.limit) : 20

    return this.templateService.getAll(page, limit, true, filterTemplateDTO)
  }
}
// @Put('update')
// @UseGuards(AuthGuard)
// @Roles(UserRole.ADMIN, UserRole.EMPLOYEE, UserRole.USER)
// update(@Query() query: { id: string }, @Body() updateOrdertDTO: UpdateOrderDTO, @Req() req: any) {
//   return this.orderService.update(query.id, updateOrdertDTO, req.user_data.id)
// }

// @Get('')
// @UseGuards(AuthGuard)
// @Roles(UserRole.ADMIN, UserRole.EMPLOYEE)
// async getAll(@Query() query: any) {
//   const page = query.page ? Number(query.page) : 1
//   const limit = query.limit ? Number(query.limit) : 20
//   const status = query.status ? query.status : ''
//   return this.orderService.getAll(page, limit, status)
// }

// @Post('getOrderByUser')
// @UseGuards(AuthGuard)
// @Roles(UserRole.ADMIN, UserRole.EMPLOYEE, UserRole.USER)
// async getOrderByUser(@Query() query: any, @Body() getOrderByUserDTO: GetOrderByUserDTO, @Req() req: any) {
//   const page = query.page ? Number(query.page) : 1
//   const limit = query.limit ? Number(query.limit) : 20

//   return this.orderService.getOrderByUser(page, limit, req.user_data.id, getOrderByUserDTO.status)
// }
