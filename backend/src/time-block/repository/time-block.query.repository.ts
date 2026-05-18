import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class TimeBlockQueryRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByDate(userId: string, date: Date) {
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);
    const end = new Date(date);
    end.setHours(23, 59, 59, 999);

    return this.prisma.timeBlock.findMany({
      where: { userId, date: { gte: start, lte: end } },
      select: {
        id: true,
        title: true,
        startTime: true,
        endTime: true,
        date: true,
        isDone: true,
        createdAt: true,
        video: { select: { s3Url: true } },
      },
      orderBy: { startTime: 'asc' },
    });
  }

  async findById(id: string, userId: string) {
    return this.prisma.timeBlock.findFirst({
      where: { id, userId },
      select: {
        id: true,
        title: true,
        startTime: true,
        endTime: true,
        date: true,
        isDone: true,
        createdAt: true,
        video: { select: { s3Url: true } },
      },
    });
  }
}
