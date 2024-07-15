import {
  Body,
  Controller,
  Post,
  UseGuards,
  Req,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  Query,
  Put,
  HttpException,
  HttpStatus,
} from '@nestjs/common'
import { UserRole } from 'src/enums/role.enum'
import { AuthGuard } from 'src/guards/auth.guard'
import { Roles } from 'src/decorators/roles.decorator'
import { FileInterceptor } from '@nestjs/platform-express'
import { storageConfig } from 'src/common/config'
import { fileFilter } from 'src/common/fileFilter'
import { OptionService } from './option.service'
import { CreateOptionDTO, UpdateOptionDTO } from 'src/dtos/option.dto'
import { CloudinaryService } from 'src/common/uploadImage'
import { deleteImage } from 'src/common/deleteImage'

@Controller('options')
export class OptionController {
  constructor(
    private optionService: OptionService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}
  @Post('create')
  @UseGuards(AuthGuard)
  @Roles(UserRole.ADMIN, UserRole.EMPLOYEE)
  @UseInterceptors(
    FileInterceptor('option_image', {
      storage: storageConfig('option_image'),
      fileFilter,
    }),
  )
  async create(@UploadedFile() file: Express.Multer.File, @Body() createOptionDTO: CreateOptionDTO, @Req() req: any) {
    if (req.fileValidationError) {
      throw new BadRequestException(req.fileValidationError)
    }
    try {
      const result_image = await this.cloudinaryService.uploadImage(file.path, 'option')
      deleteImage(file.path)

      return this.optionService.create(createOptionDTO, req.user_data.id, file ? result_image.secure_url : null)
    } catch (error) {
      console.log(error)
      deleteImage(file.path)
      throw new HttpException('Upload ảnh thất bại !', HttpStatus.BAD_REQUEST)
    }
  }

  @Put('update')
  @UseGuards(AuthGuard)
  @Roles(UserRole.ADMIN, UserRole.EMPLOYEE, UserRole.USER)
  @UseInterceptors(
    FileInterceptor('option_image', {
      storage: storageConfig('option_image'),
      fileFilter,
    }),
  )
  update(
    @Query() query: { id: string },
    @UploadedFile() file: Express.Multer.File,
    @Body() updateOptionDTO: UpdateOptionDTO,
    @Req() req: any,
  ) {
    if (req.fileValidationError) {
      throw new BadRequestException(req.fileValidationError)
    }
    return this.optionService.update(
      query.id,
      updateOptionDTO,
      req.user_data.id,
      file ? file.destination + '/' + file.filename : null,
    )
  }
}
