import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { ReactionQueryRepository } from './repository/reaction.query.repository';
import { ReactionCommandRepository } from './repository/reaction.command.repository';
import { AddReactionDto, ReactionSummaryDto } from './dto/reaction.dto';
import { EventsGateway } from '../events/events.gateway';

@Injectable()
export class ReactionService {
  constructor(
    private readonly reactionQuery: ReactionQueryRepository,
    private readonly reactionCommand: ReactionCommandRepository,
    private readonly eventsGateway: EventsGateway,
  ) {}

  // 특정 영상의 반응 목록 조회 - 이모티콘별 카운트 + 내가 눌렀는지 여부 포함
  async getReactions(userId: string, videoId: string): Promise<ReactionSummaryDto[]> {
    const video = await this.reactionQuery.findVideo(videoId);
    if (!video) throw new NotFoundException('영상을 찾을 수 없습니다.');

    const [grouped, userReactions] = await Promise.all([
      this.reactionQuery.findByVideoId(videoId),
      this.reactionQuery.findUserReactions(userId, videoId),
    ]);

    const myEmojis = new Set(userReactions.map((r) => r.emoji));

    return grouped.map((g) => ({
      emoji: g.emoji,
      count: g._count.emoji,
      reacted: myEmojis.has(g.emoji),
    }));
  }

  // 이모티콘 반응 추가 - 같은 이모티콘 중복 반응 불가, 그룹 멤버에게 실시간 알림 전송
  async addReaction(userId: string, videoId: string, dto: AddReactionDto): Promise<ReactionSummaryDto[]> {
    const video = await this.reactionQuery.findVideo(videoId);
    if (!video) throw new NotFoundException('영상을 찾을 수 없습니다.');

    const existing = await this.reactionQuery.findOne(userId, videoId, dto.emoji);
    if (existing) throw new ConflictException('이미 해당 반응을 눌렀습니다.');

    await this.reactionCommand.create({ userId, videoId, emoji: dto.emoji });

    const reactions = await this.getReactions(userId, videoId);

    // 영상 소유자에게 실시간 반응 알림 전송
    this.eventsGateway.notifyGroup([video.userId], 'reaction:added', {
      videoId,
      emoji: dto.emoji,
      fromUserId: userId,
      reactions,
    });

    return reactions;
  }

  // 이모티콘 반응 취소 - 취소 후 업데이트된 반응 목록 반환
  async removeReaction(userId: string, videoId: string, emoji: string): Promise<ReactionSummaryDto[]> {
    const existing = await this.reactionQuery.findOne(userId, videoId, emoji);
    if (!existing) throw new NotFoundException('해당 반응을 찾을 수 없습니다.');

    await this.reactionCommand.delete(userId, videoId, emoji);

    return this.getReactions(userId, videoId);
  }
}
