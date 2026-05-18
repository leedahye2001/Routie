import { IsDateString, IsString, MaxLength } from 'class-validator';

export class CreateTimeBlockDto {
  @IsString()
  @MaxLength(50)
  title: string;

  @IsDateString()
  startTime: string;

  @IsDateString()
  endTime: string;

  @IsDateString()
  date: string;
}
