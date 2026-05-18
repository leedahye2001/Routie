import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

type Tx = Prisma.TransactionClient;

@Injectable()
export class TimeBlockCommandRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    data: { userId: string; title: string; startTime: Date; endTime: Date; date: Date },
    tx?: Tx,
  ) {
    return (tx ?? this.prisma).timeBlock.create({
      data,
      select: {
        id: true,
        title: true,
        startTime: true,
        endTime: true,
        date: true,
        isDone: true,
        createdAt: true,
      },
    });
  }

  async update(
    id: string,
    data: { title?: string; startTime?: Date; endTime?: Date; date?: Date },
    tx?: Tx,
  ) {
    return (tx ?? this.prisma).timeBlock.update({
      where: { id },
      data,
      select: {
        id: true,
        title: true,
        startTime: true,
        endTime: true,
        date: true,
        isDone: true,
        createdAt: true,
      },
    });
  }

  async markDone(id: string, tx?: Tx) {
    return (tx ?? this.prisma).timeBlock.update({
      where: { id },
      data: { isDone: true },
      select: { id: true, isDone: true },
    });
  }

  async delete(id: string, tx?: Tx) {
    return (tx ?? this.prisma).timeBlock.delete({ where: { id } });
  }
}
