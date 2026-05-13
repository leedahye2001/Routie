import { IsEmail, IsEnum, IsOptional, IsString, MinLength } from 'class-validator';
import { Platform } from '@prisma/client';

export class RegisterDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;

  @IsString()
  nickname: string;

  @IsString()
  @IsOptional()
  deviceId?: string;

  @IsString()
  @IsOptional()
  fcmToken?: string;

  @IsEnum(Platform)
  @IsOptional()
  platform?: Platform;
}
