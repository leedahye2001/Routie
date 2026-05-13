import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

type Tx = Prisma.TransactionClient;

@Injectable()
export class GroupCommandRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createGroup(data: { name: string }, tx?: Tx) {
    return (tx ?? this.prisma).group.create({
      data,
      select: { id: true, name: true, inviteCode: true, createdAt: true },
    });
  }

  async createGroupMember(data: { groupId: string; userId: string }, tx?: Tx) {
    return (tx ?? this.prisma).groupMember.create({ data });
  }
}
