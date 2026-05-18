import { Body, Controller, Delete, HttpCode, Param, Post, UseGuards } from '@nestjs/common';
import { VideoService } from './video.service';
import { ConfirmUploadDto, GetPresignedUrlDto } from './dto/video.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { AuthUser } from '../auth/strategy/jwt.strategy';

@UseGuards(JwtAuthGuard)
@Controller('videos')
export class VideoController {
  constructor(private readonly videoService: VideoService) {}

  @Post('presigned-url')
  getPresignedUrl(@CurrentUser() user: AuthUser, @Body() dto: GetPresignedUrlDto) {
    return this.videoService.getPresignedUrl(user.userId, dto);
  }

  @Post(':timeBlockId/confirm')
  confirmUpload(
    @CurrentUser() user: AuthUser,
    @Param('timeBlockId') timeBlockId: string,
    @Body() dto: ConfirmUploadDto,
  ) {
    return this.videoService.confirmUpload(user.userId, timeBlockId, dto);
  }

  @Delete(':timeBlockId')
  @HttpCode(204)
  deleteVideo(@CurrentUser() user: AuthUser, @Param('timeBlockId') timeBlockId: string) {
    return this.videoService.deleteVideo(user.userId, timeBlockId);
  }
}
