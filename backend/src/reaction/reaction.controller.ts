import { Body, Controller, Delete, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ReactionService } from './reaction.service';
import { AddReactionDto } from './dto/reaction.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { AuthUser } from '../auth/strategy/jwt.strategy';

@UseGuards(JwtAuthGuard)
@Controller('reactions')
export class ReactionController {
  constructor(private readonly reactionService: ReactionService) {}

  // 특정 영상의 반응 목록 조회
  @Get(':videoId')
  getReactions(@CurrentUser() user: AuthUser, @Param('videoId') videoId: string) {
    return this.reactionService.getReactions(user.userId, videoId);
  }

  // 이모티콘 반응 추가
  @Post(':videoId')
  addReaction(
    @CurrentUser() user: AuthUser,
    @Param('videoId') videoId: string,
    @Body() dto: AddReactionDto,
  ) {
    return this.reactionService.addReaction(user.userId, videoId, dto);
  }

  // 이모티콘 반응 취소
  @Delete(':videoId/:emoji')
  removeReaction(
    @CurrentUser() user: AuthUser,
    @Param('videoId') videoId: string,
    @Param('emoji') emoji: string,
  ) {
    return this.reactionService.removeReaction(user.userId, videoId, emoji);
  }
}
