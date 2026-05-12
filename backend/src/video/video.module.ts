import { Module } from '@nestjs/common';
import { VideoController } from './video.controller';
import { VideoService } from './video.service';
import { VideoQueryRepository } from './repository/video.query.repository';
import { VideoCommandRepository } from './repository/video.command.repository';

@Module({
  controllers: [VideoController],
  providers: [VideoService, VideoQueryRepository, VideoCommandRepository],
})
export class VideoModule {}
