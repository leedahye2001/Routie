import { Injectable } from '@nestjs/common';
import { VideoQueryRepository } from './repository/video.query.repository';
import { VideoCommandRepository } from './repository/video.command.repository';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class VideoService {
  constructor(
    private readonly videoQuery: VideoQueryRepository,
    private readonly videoCommand: VideoCommandRepository,
    private readonly prisma: PrismaService,
  ) {}
}
