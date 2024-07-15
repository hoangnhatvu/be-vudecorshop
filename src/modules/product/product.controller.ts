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
import { UserRole } from 'src/enums/role.enum'
import { AuthGuard } from 'src/guards/auth.guard'
import { Roles } from 'src/decorators/roles.decorator'
import { FileFieldsInterceptor, FileInterceptor, FilesInterceptor } from '@nestjs/platform-express'
import { storageConfig } from 'src/common/config'
import { fileFilter } from 'src/common/fileFilter'
import { ProductService } from './product.service'
import { CreateProductDTO, FilterProductDTO, UpdateProductDTO } from 'src/dtos/product.dto'
import { CloudinaryService } from 'src/common/uploadImage'
import { deleteImage } from 'src/common/deleteImage'
import { uploadToFirebase } from 'src/common/uploadObject3d'
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
        storage: storageConfig('product_assets'),
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
      const result_image = await this.cloudinaryService.uploadImage(files.product_image[0].path, 'product')
      const result_3d = await uploadToFirebase(files.product_3d[0])
      deleteImage(files.product_image[0].path)
      deleteImage(files.product_3d[0].path)
      return this.productService.create(
        createProductDTO,
        req.user_data.id,
        files.product_image[0] ? result_image.secure_url : null,
        files.product_3d[0] ? result_3d : null,
      )
    } catch (error) {
      console.log(error)
      deleteImage(files.product_image[0].path)
      deleteImage(files.product_3d[0].path)
      throw new HttpException('Upload ảnh thất bại !', HttpStatus.BAD_REQUEST)
    }
  }

  @Put('update')
  @UseGuards(AuthGuard)
  @Roles(UserRole.ADMIN, UserRole.EMPLOYEE)
  @UseInterceptors(
    FileInterceptor('product_image', {
      storage: storageConfig('product_image'),
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
