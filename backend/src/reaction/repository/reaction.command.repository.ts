import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

type Tx = Prisma.TransactionClient;

@Injectable()
export class ReactionCommandRepository {
  constructor(private readonly prisma: PrismaService) {}

  // 이모티콘 반응 추가
  async create(data: { userId: string; videoId: string; emoji: string }, tx?: Tx) {
    return (tx ?? this.prisma).reaction.create({ data });
  }

  // 이모티콘 반응 취소 (삭제)
  async delete(userId: string, videoId: string, emoji: string, tx?: Tx) {
    return (tx ?? this.prisma).reaction.delete({
      where: { userId_videoId_emoji: { userId, videoId, emoji } },
    });
  }
}
