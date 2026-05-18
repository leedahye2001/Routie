import { Injectable, NotFoundException } from '@nestjs/common';
import { VideoQueryRepository } from './repository/video.query.repository';
import { VideoCommandRepository } from './repository/video.command.repository';
import { S3Service } from '../s3/s3.service';
import { ConfirmUploadDto, GetPresignedUrlDto, VideoResponseDto } from './dto/video.dto';
import { PrismaService } from '../prisma/prisma.service';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class VideoService {
  constructor(
    private readonly videoQuery: VideoQueryRepository,
    private readonly videoCommand: VideoCommandRepository,
    private readonly s3: S3Service,
    private readonly prisma: PrismaService,
  ) {}

  async getPresignedUrl(userId: string, dto: GetPresignedUrlDto) {
    const timeBlock = await this.videoQuery.findTimeBlock(dto.timeBlockId, userId);
    if (!timeBlock) throw new NotFoundException('타임블록을 찾을 수 없습니다.');

    const ext = dto.contentType === 'video/quicktime' ? 'mov' : 'mp4';
    const s3Key = `videos/${userId}/${dto.timeBlockId}/${uuidv4()}.${ext}`;
    const uploadUrl = await this.s3.getPresignedUploadUrl(s3Key, dto.contentType);

    return { uploadUrl, s3Key };
  }

  async confirmUpload(userId: string, timeBlockId: string, dto: ConfirmUploadDto): Promise<VideoResponseDto> {
    const timeBlock = await this.videoQuery.findTimeBlock(timeBlockId, userId);
    if (!timeBlock) throw new NotFoundException('타임블록을 찾을 수 없습니다.');

    const existing = await this.videoQuery.findByTimeBlockId(timeBlockId);

    const s3Url = this.s3.getPublicUrl(dto.s3Key);

    if (existing) {
      await this.s3.deleteObject(existing.s3Key);
      await this.videoCommand.delete(existing.id);
    }

    const video = await this.videoCommand.create({
      userId,
      timeBlockId,
      s3Key: dto.s3Key,
      s3Url,
    });

    return video;
  }

  async deleteVideo(userId: string, timeBlockId: string): Promise<void> {
    const video = await this.videoQuery.findByTimeBlockId(timeBlockId);
    if (!video) throw new NotFoundException('영상을 찾을 수 없습니다.');

    await this.s3.deleteObject(video.s3Key);
    await this.videoCommand.delete(video.id);
  }
}
