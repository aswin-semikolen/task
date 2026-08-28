import { Transform } from 'class-transformer';
import {
  IsDateString,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import { Gender, UserStatus } from '../../common/enums';
import { IsNotInFuture } from '../../common/validators/is-not-in-future.validator';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty({ message: 'First name is required' })
  @MaxLength(50)
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  firstName: string;

  @IsString()
  @IsNotEmpty({ message: 'Last name is required' })
  @MaxLength(50)
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  lastName: string;

  @IsEmail({}, { message: 'A valid email is required' })
  @MaxLength(255)
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim().toLowerCase() : value,
  )
  email: string;

  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters' })
  @MaxLength(64)
  @Matches(/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
    message:
      'Password must contain an uppercase letter, a lowercase letter and a number',
  })
  password: string;

  @IsString()
  @IsNotEmpty({ message: 'Phone number is required' })
  @Matches(/^[+]?[\d\s()-]{7,20}$/, { message: 'Phone number is not valid' })
  phoneNumber: string;

  @IsDateString({}, { message: 'Date of birth must be a valid date' })
  @IsNotInFuture({ message: 'Date of birth cannot be in the future' })
  dateOfBirth: string;

  @IsEnum(Gender, { message: 'Gender must be male, female or other' })
  gender: Gender;

  @IsString()
  @IsNotEmpty({ message: 'Address is required' })
  @MaxLength(255)
  address: string;

  @IsString()
  @IsNotEmpty({ message: 'City is required' })
  @MaxLength(100)
  city: string;

  @IsString()
  @IsNotEmpty({ message: 'Country is required' })
  @MaxLength(100)
  country: string;

  @IsOptional()
  @IsEnum(UserStatus, { message: 'Status must be active or inactive' })
  status?: UserStatus;
}
