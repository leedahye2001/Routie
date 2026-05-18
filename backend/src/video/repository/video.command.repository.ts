import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

type Tx = Prisma.TransactionClient;

@Injectable()
export class VideoCommandRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    data: { userId: string; timeBlockId: string; s3Key: string; s3Url: string },
    tx?: Tx,
  ) {
    return (tx ?? this.prisma).video.create({
      data,
      select: { id: true, s3Url: true, timeBlockId: true, uploadedAt: true },
    });
  }

  async delete(id: string, tx?: Tx) {
    return (tx ?? this.prisma).video.delete({ where: { id } });
  }
}
