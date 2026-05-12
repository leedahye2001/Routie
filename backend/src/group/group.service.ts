import { Injectable } from '@nestjs/common';
import { GroupQueryRepository } from './repository/group.query.repository';
import { GroupCommandRepository } from './repository/group.command.repository';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class GroupService {
  constructor(
    private readonly groupQuery: GroupQueryRepository,
    private readonly groupCommand: GroupCommandRepository,
    private readonly prisma: PrismaService,
  ) {}
}
