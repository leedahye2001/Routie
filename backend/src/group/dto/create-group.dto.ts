import { IsString, MaxLength } from 'class-validator';

export class CreateGroupDto {
  @IsString()
  @MaxLength(30)
  name: string;
}
