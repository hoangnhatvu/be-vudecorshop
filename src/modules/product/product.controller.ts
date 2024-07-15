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
  HttpException,
  HttpStatus,
  UploadedFiles,
} from '@nestjs/common'
import { UserRole } from '../../enums/role.enum'
import { AuthGuard } from '../../guards/auth.guard'
import { Roles } from '../../decorators/roles.decorator'
import { FileFieldsInterceptor, FileInterceptor, FilesInterceptor } from '@nestjs/platform-express'
import { fileFilter } from '../../common/fileFilter'
import { ProductService } from './product.service'
import { CreateProductDTO, FilterProductDTO, UpdateProductDTO } from '../../dtos/product.dto'
import { CloudinaryService } from '../../common/uploadImage'
import { uploadToFirebase } from '../../common/uploadObject3d'
@Controller('products')
export class ProductController {
  constructor(
    private productService: ProductService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}
  @Post('create')
  @UseGuards(AuthGuard)
  @Roles(UserRole.ADMIN, UserRole.EMPLOYEE)
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'product_image', maxCount: 1 },
        { name: 'product_3d', maxCount: 1 },
      ],
      {
        fileFilter,
      },
    ),
  )
  async create(
    @UploadedFiles() files: { product_image?: Express.Multer.File[]; product_3d?: Express.Multer.File[] },
    @Body() createProductDTO: CreateProductDTO,
    @Req() req: any,
  ) {
    if (req.fileValidationError) {
      throw new BadRequestException(req.fileValidationError)
    }
    try {
      console.log(files.product_image[0], files.product_3d[0] )
      const result_3d = await uploadToFirebase(files.product_3d[0])
      const result_image = await this.cloudinaryService.uploadImage(files.product_image[0])
      return this.productService.create(
        createProductDTO,
        req.user_data.id,
        files.product_image[0] ? result_image.secure_url : null,
        files.product_3d[0] ? result_3d : null,
      )
    } catch (error) {
      console.log(error)
      throw new HttpException('Upload ảnh thất bại !', HttpStatus.BAD_REQUEST)
    }
  }

  @Put('update')
  @UseGuards(AuthGuard)
  @Roles(UserRole.ADMIN, UserRole.EMPLOYEE)
  @UseInterceptors(
    FileInterceptor('product_image', {
      fileFilter,
    }),
  )
  update(
    @Query() query: { id: string },
    @UploadedFile() file: Express.Multer.File,
    @Body() updateProductDTO: UpdateProductDTO,
    @Req() req: any,
  ) {
    if (req.fileValidationError) {
      throw new BadRequestException(req.fileValidationError)
    }
    return this.productService.update(
      query.id,
      updateProductDTO,
      req.user_data.id,
      file ? file.destination + '/' + file.filename : null,
    )
  }

  @Post('search')
  @HttpCode(200)
  async findProducts(@Query() query, @Body() filterProductDTO: FilterProductDTO) {
    const page = query.page ? Number(query.page) : 1
    const limit = query.limit ? Number(query.limit) : 20

    return this.productService.getAll(page, limit, false, filterProductDTO)
  }

  @Post('searchForAdmin')
  @UseGuards(AuthGuard)
  @Roles(UserRole.ADMIN, UserRole.EMPLOYEE, UserRole.USER)
  @HttpCode(200)
  async getAll(@Query() query, @Body() filterProductDTO: FilterProductDTO) {
    const page = query.page ? Number(query.page) : 1
    const limit = query.limit ? Number(query.limit) : 20

    return this.productService.getAll(page, limit, true, filterProductDTO)
  }

  @Put('delete')
  @UseGuards(AuthGuard)
  @Roles(UserRole.ADMIN, UserRole.EMPLOYEE)
  @HttpCode(200)
  async delete(@Query() query: { id: string }) {
    return this.productService.delete(query.id)
  }
}
