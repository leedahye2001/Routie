import { Injectable } from '@nestjs/common';
import { TimeBlockQueryRepository } from './repository/time-block.query.repository';
import { TimeBlockCommandRepository } from './repository/time-block.command.repository';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TimeBlockService {
  constructor(
    private readonly timeBlockQuery: TimeBlockQueryRepository,
    private readonly timeBlockCommand: TimeBlockCommandRepository,
    private readonly prisma: PrismaService,
  ) {}
}
