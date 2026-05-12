import { Controller, UseGuards } from '@nestjs/common';
import { VideoService } from './video.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('videos')
export class VideoController {
  constructor(private readonly videoService: VideoService) {}
}
