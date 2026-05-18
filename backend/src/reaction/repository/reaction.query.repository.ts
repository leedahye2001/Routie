import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ReactionQueryRepository {
  constructor(private readonly prisma: PrismaService) {}

  // 특정 영상의 모든 반응을 이모티콘별로 그룹화하여 반환
  async findByVideoId(videoId: string) {
    return this.prisma.reaction.groupBy({
      by: ['emoji'],
      where: { videoId },
      _count: { emoji: true },
      orderBy: { _count: { emoji: 'desc' } },
    });
  }

  // 현재 유저가 특정 영상에 남긴 모든 반응 조회
  async findUserReactions(userId: string, videoId: string) {
    return this.prisma.reaction.findMany({
      where: { userId, videoId },
      select: { emoji: true },
    });
  }

  // 특정 반응 단건 조회 (중복 방지 및 삭제 시 사용)
  async findOne(userId: string, videoId: string, emoji: string) {
    return this.prisma.reaction.findUnique({
      where: { userId_videoId_emoji: { userId, videoId, emoji } },
    });
  }

  // 영상 존재 여부 확인
  async findVideo(videoId: string) {
    return this.prisma.video.findUnique({
      where: { id: videoId },
      select: { id: true },
    });
  }
}
