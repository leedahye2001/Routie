import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { GroupModule } from './group/group.module';
import { TimeBlockModule } from './time-block/time-block.module';
import { VideoModule } from './video/video.module';

@Module({
  imports: [PrismaModule, AuthModule, GroupModule, TimeBlockModule, VideoModule],
})
export class AppModule {}
