import { IsDateString, IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateTimeBlockDto {
  @IsString()
  @MaxLength(50)
  @IsOptional()
  title?: string;

  @IsDateString()
  @IsOptional()
  startTime?: string;

  @IsDateString()
  @IsOptional()
  endTime?: string;

  @IsDateString()
  @IsOptional()
  date?: string;
}
