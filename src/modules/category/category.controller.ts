import {
  Body,
  Controller,
  Post,
  UseGuards,
  Req,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  HttpCode,
  Query,
  Get,
  Put,
  Param,
  HttpException,
  HttpStatus,
} from '@nestjs/common'
import { CategoryService, PaginatedCategory } from './category.service'
import { UserRole } from '../../enums/role.enum'
import { AuthGuard } from '../../guards/auth.guard'
import { Roles } from '../../decorators/roles.decorator'
import { CreateCategoryDTO, UpdateCategoryDTO } from '../../dtos/category.dto'
import { FileInterceptor } from '@nestjs/platform-express'
import { fileFilter } from '../../common/fileFilter'
import { CloudinaryService } from '../../common/uploadImage'

@Controller('categories')
export class CategoryController {
  constructor(
    private categoryService: CategoryService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}
  @Post('create')
  @UseGuards(AuthGuard)
  @Roles(UserRole.ADMIN)
  @UseInterceptors(
    FileInterceptor('category_image', {
      fileFilter,
    }),
  )
  async create(
    @UploadedFile() file: Express.Multer.File,
    @Body() categoryCreateDTO: CreateCategoryDTO,
    @Req() req: any,
  ) {
    if (req.fileValidationError) {
      throw new BadRequestException(req.fileValidationError)
    }
    try {
      const result_image = await this.cloudinaryService.uploadImage(file)
      console.log(result_image)
      return this.categoryService.create(categoryCreateDTO, req.user_data.id, file ? result_image.secure_url : null)
    } catch (error) {
      console.log(error)
      throw new HttpException('Upload ảnh thất bại !', HttpStatus.BAD_REQUEST)
    }
  }

  @Put('update')
  @UseGuards(AuthGuard)
  @Roles(UserRole.ADMIN)
  @UseInterceptors(
    FileInterceptor('category_image', {
      fileFilter,
    }),
  )
  update(
    @Query() query: { id: string },
    @UploadedFile() file: Express.Multer.File,
    @Body() categoryUpdateDTO: UpdateCategoryDTO,
    @Req() req: any,
  ) {
    if (req.fileValidationError) {
      throw new BadRequestException(req.fileValidationError)
    }
    return this.categoryService.update(
      query.id,
      categoryUpdateDTO,
      req.user_data.id,
      file ? file.destination + '/' + file.filename : null,
    )
  }

  @Get('search')
  @HttpCode(200)
  async findCategories(@Query() query: any) {
    const page = query.page ? Number(query.page) : 1
    const limit = query.limit ? Number(query.limit) : 20
    return this.categoryService.getAll(page, limit, false)
  }

  @Get()
  @UseGuards(AuthGuard)
  @Roles(UserRole.ADMIN, UserRole.EMPLOYEE, UserRole.USER)
  @HttpCode(200)
  async getAll(@Query() query: any) {
    const page = query.page ? Number(query.page) : 1
    const limit = query.limit ? Number(query.limit) : 20
    return this.categoryService.getAll(page, limit, true)
  }
}
