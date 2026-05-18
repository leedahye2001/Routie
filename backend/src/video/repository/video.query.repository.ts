import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class VideoQueryRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByTimeBlockId(timeBlockId: string) {
    return this.prisma.video.findUnique({
      where: { timeBlockId },
      select: { id: true, s3Key: true, s3Url: true, timeBlockId: true, uploadedAt: true },
    });
  }

  async findTimeBlock(timeBlockId: string, userId: string) {
    return this.prisma.timeBlock.findFirst({
      where: { id: timeBlockId, userId },
      select: { id: true, isDone: true },
    });
  }
}
