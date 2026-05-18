import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { S3Module } from './s3/s3.module';
import { AuthModule } from './auth/auth.module';
import { GroupModule } from './group/group.module';
import { TimeBlockModule } from './time-block/time-block.module';
import { VideoModule } from './video/video.module';
import { ReactionModule } from './reaction/reaction.module';
import { EventsModule } from './events/events.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    S3Module,
    AuthModule,
    GroupModule,
    TimeBlockModule,
    VideoModule,
    ReactionModule,
    EventsModule,
  ],
})
export class AppModule {}
