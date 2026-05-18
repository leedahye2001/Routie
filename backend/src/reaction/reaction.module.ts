import { Module } from '@nestjs/common';
import { ReactionController } from './reaction.controller';
import { ReactionService } from './reaction.service';
import { ReactionQueryRepository } from './repository/reaction.query.repository';
import { ReactionCommandRepository } from './repository/reaction.command.repository';
import { EventsModule } from '../events/events.module';

@Module({
  imports: [EventsModule],
  controllers: [ReactionController],
  providers: [ReactionService, ReactionQueryRepository, ReactionCommandRepository],
})
export class ReactionModule {}
