import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

type Tx = Prisma.TransactionClient;

@Injectable()
export class TimeBlockCommandRepository {
  constructor(private readonly prisma: PrismaService) {}
}
