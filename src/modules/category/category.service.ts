import {
  HttpException,
  HttpStatus,
  Injectable,
  Response,
} from '@nestjs/common';
import { generateUpdateToken } from 'src/common/generate-update-token';
import { plainToInstance } from 'class-transformer';
import {
  CategoryDTO,
  CreateCategoryDTO,
  UpdateCategoryDTO,
} from 'src/dtos/category.dto';
import { Category } from 'src/types/category';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { User } from 'src/types/user';
import { deleteImage } from 'src/common/deleteImage';

export interface PaginatedCategory {
  data: CategoryDTO[];
  page: number;
  limit: number;
  totalCount: number;
  totalPage: number;
}

@Injectable()
export class CategoryService {
  constructor(
    @InjectModel('Category') private categoryModel: Model<Category>,
    @InjectModel('User') private userModel: Model<User>,
  ) {}

  async create(
    createCategoryDTO: CreateCategoryDTO,
    userid: string,
    categoryImage: string,
  ): Promise<CategoryDTO> {
    try {
      const user = await this.userModel.findOne({ _id: userid });

      if (!user) {
        throw new HttpException('Không tìm thấy người dùng !', HttpStatus.NOT_FOUND);
      }

      const category = new this.categoryModel({
        ...createCategoryDTO,
        updated_token: generateUpdateToken(),
        category_image: categoryImage,
        created_by: user,        
      });

      await category.save();

      return plainToInstance(CategoryDTO, category, {
        excludeExtraneousValues: true,
      });
    } catch (err) {
      if (err instanceof HttpException) {
        throw err;
      } else
        throw new HttpException(
          'Lỗi server !',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
    }
  }

  async update(
    categoryid: string,
    updateCategoryDTO: UpdateCategoryDTO,
    userid: string,
    newImage: string,
  ) {
    try {
      const user = await this.userModel.findOne({ _id: userid });
      const category = await this.categoryModel.findOne({ _id: categoryid });

      if (!user) {
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);
      }

      if (!category) {
        throw new HttpException('Category not found', HttpStatus.NOT_FOUND);
      }

      if (category.updated_token !== updateCategoryDTO.updated_token) {
        throw new HttpException(
          'Category is being updated by another user',
          HttpStatus.CONFLICT,
        );
      }

      const oldImage = category.category_image;

      const updateCategoryData = {
        ...updateCategoryDTO,
        updated_token: generateUpdateToken(),
        updated_by: user,
        category_image: newImage ? newImage : oldImage,
        updated_date: Date.now(),
      };

      const updateResult = await category.updateOne(updateCategoryData);

      if (updateResult.modifiedCount > 0) {
        if (newImage) {
          deleteImage(oldImage);
        }
        return { message: 'Update successfully' };
      } else {
        throw new HttpException('Update fail', HttpStatus.NOT_IMPLEMENTED);
      }
    } catch (err) {
      deleteImage(newImage);
      if (err instanceof HttpException) {
        throw err;
      } else {
        throw new HttpException(
          'Internal server error',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  }

  async getAll(page?: number, limit?: number, isAdmin?: boolean): Promise<PaginatedCategory> {
    const query = {
      ...(isAdmin ? {} : {is_actived: true}),
    }

    const categories = await this.categoryModel
      .find(query)
      .populate('created_by')
      .populate('updated_by')
      .skip((page - 1) * limit)
      .limit(limit)

    const totalCount = categories.length;

    const totalPage = Math.ceil(totalCount / limit);

    return {
      data: plainToInstance(CategoryDTO, categories, {
        excludeExtraneousValues: true,
        enableImplicitConversion: true,
      }),
      page,
      limit,
      totalCount,
      totalPage,
    };
  }
}
