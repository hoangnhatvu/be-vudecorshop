import { Expose, Type } from 'class-transformer';
import { UserInfoDTO } from './user.dto';

export class MetaDataDTO {
    @Expose()
    @Type(() => UserInfoDTO)
    created_by: UserInfoDTO;
  
    @Expose()
    created_date: Date;
  
    @Expose()
    @Type(() => UserInfoDTO)
    updated_by: UserInfoDTO;
  
    @Expose()
    updated_date: Date;
  
    @Expose()
    updated_token: string;
}
