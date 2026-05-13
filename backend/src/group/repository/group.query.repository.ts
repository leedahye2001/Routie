import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class GroupQueryRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findGroupById(groupId: string) {
    return this.prisma.group.findUnique({
      where: { id: groupId },
      select: {
        id: true,
        name: true,
        inviteCode: true,
        createdAt: true,
        members: {
          select: {
            joinedAt: true,
            user: { select: { id: true, nickname: true } },
          },
        },
      },
    });
  }

  async findGroupByInviteCode(inviteCode: string) {
    return this.prisma.group.findUnique({
      where: { inviteCode },
      select: { id: true, name: true, inviteCode: true },
    });
  }

  async findMyGroups(userId: string) {
    return this.prisma.group.findMany({
      where: { members: { some: { userId } } },
      select: {
        id: true,
        name: true,
        inviteCode: true,
        _count: { select: { members: true } },
      },
    });
  }

  async findMembership(userId: string, groupId: string) {
    return this.prisma.groupMember.findUnique({
      where: { userId_groupId: { userId, groupId } },
    });
  }
}
