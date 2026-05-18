import { IsIn, IsString, IsUUID } from 'class-validator';

export class GetPresignedUrlDto {
  @IsUUID()
  timeBlockId: string;

  @IsString()
  @IsIn(['video/mp4', 'video/quicktime', 'video/mov'])
  contentType: string;
}

export class ConfirmUploadDto {
  @IsString()
  s3Key: string;
}

export class VideoResponseDto {
  id: string;
  s3Url: string;
  timeBlockId: string;
  uploadedAt: Date;
}
