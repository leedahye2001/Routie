import { Module } from '@nestjs/common';
import { TimeBlockController } from './time-block.controller';
import { TimeBlockService } from './time-block.service';
import { TimeBlockQueryRepository } from './repository/time-block.query.repository';
import { TimeBlockCommandRepository } from './repository/time-block.command.repository';

@Module({
  controllers: [TimeBlockController],
  providers: [TimeBlockService, TimeBlockQueryRepository, TimeBlockCommandRepository],
})
export class TimeBlockModule {}
