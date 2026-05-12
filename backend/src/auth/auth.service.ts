import { Injectable } from '@nestjs/common';
import { AuthQueryRepository } from './repository/auth.query.repository';
import { AuthCommandRepository } from './repository/auth.command.repository';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly authQuery: AuthQueryRepository,
    private readonly authCommand: AuthCommandRepository,
    private readonly prisma: PrismaService,
  ) {}
}
