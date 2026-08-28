import { PartialType } from '@nestjs/mapped-types';
import { IsOptional } from 'class-validator';
import { CreateUserDto } from './create-user.dto';

/**
 * All fields optional. Password is only re-hashed when a non-empty value is
 * sent, so editing a user without touching the password leaves it untouched.
 */
export class UpdateUserDto extends PartialType(CreateUserDto) {
  @IsOptional()
  password?: string;
}
