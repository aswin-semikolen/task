import { IsEnum, IsOptional, IsString } from 'class-validator';
import { Gender, UserStatus } from '../../common/enums';

export class ReportQueryDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsEnum(UserStatus)
  status?: UserStatus;

  @IsOptional()
  @IsEnum(Gender)
  gender?: Gender;
}
