import { Module } from '@nestjs/common';
import { GroupController } from './group.controller';
import { GroupService } from './group.service';
import { GroupQueryRepository } from './repository/group.query.repository';
import { GroupCommandRepository } from './repository/group.command.repository';

@Module({
  controllers: [GroupController],
  providers: [GroupService, GroupQueryRepository, GroupCommandRepository],
})
export class GroupModule {}
