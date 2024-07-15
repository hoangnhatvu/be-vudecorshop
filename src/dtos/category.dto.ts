import { IsBoolean, IsNotEmpty} from 'class-validator';
import { Expose, Transform, Type } from 'class-transformer';
import { BooleanPipe } from 'src/pipes/boolean.pipe';
import { MetaDataDTO } from './meta-data.dto';
export class CategoryDTO extends MetaDataDTO{
  @Expose()
  id: string;

  @Expose()
  category_name: string;

  @Expose()
  category_image: string;

  @Expose()
  is_actived: boolean;
}

export class CreateCategoryDTO {  
  @IsNotEmpty()
  category_name: string;  
}

export class UpdateCategoryDTO {  
  @IsNotEmpty()
  category_name: string;  

  @IsNotEmpty()
  updated_token: string;

  @IsNotEmpty()
  @IsBoolean()
  @Transform(value => new BooleanPipe().transform(value.value))
  is_actived: boolean;
}

export class CategoryInfoDTO {
  @Expose()
  id: string;

  @Expose()
  category_name: string;
}