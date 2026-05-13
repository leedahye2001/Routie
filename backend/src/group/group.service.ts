import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { GroupCommandRepository } from './repository/group.command.repository';
import { GroupQueryRepository } from './repository/group.query.repository';
import { CreateGroupDto } from './dto/create-group.dto';
import { GroupResponseDto, GroupSummaryDto } from './dto/group.response.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class GroupService {
  constructor(
    private readonly groupQuery: GroupQueryRepository,
    private readonly groupCommand: GroupCommandRepository,
    private readonly prisma: PrismaService,
  ) {}

  async createGroup(userId: string, dto: CreateGroupDto): Promise<GroupResponseDto> {
    const group = await this.prisma.$transaction(async (tx) => {
      const newGroup = await this.groupCommand.createGroup({ name: dto.name }, tx);
      await this.groupCommand.createGroupMember({ groupId: newGroup.id, userId }, tx);
      return newGroup;
    });

    return { ...group, members: [] };
  }

  async joinGroup(userId: string, inviteCode: string): Promise<GroupResponseDto> {
    const group = await this.groupQuery.findGroupByInviteCode(inviteCode);
    if (!group) throw new NotFoundException('존재하지 않는 초대 코드입니다.');

    const existing = await this.groupQuery.findMembership(userId, group.id);
    if (existing) throw new ConflictException('이미 참여 중인 그룹입니다.');

    await this.groupCommand.createGroupMember({ groupId: group.id, userId });

    const full = await this.groupQuery.findGroupById(group.id);
    return this.formatGroup(full!);
  }

  async getGroup(userId: string, groupId: string): Promise<GroupResponseDto> {
    const membership = await this.groupQuery.findMembership(userId, groupId);
    if (!membership) throw new NotFoundException('그룹을 찾을 수 없습니다.');

    const group = await this.groupQuery.findGroupById(groupId);
    return this.formatGroup(group!);
  }

  async getMyGroups(userId: string): Promise<GroupSummaryDto[]> {
    const groups = await this.groupQuery.findMyGroups(userId);
    return groups.map((g) => ({
      id: g.id,
      name: g.name,
      inviteCode: g.inviteCode,
      memberCount: g._count.members,
    }));
  }

  private formatGroup(group: NonNullable<Awaited<ReturnType<GroupQueryRepository['findGroupById']>>>): GroupResponseDto {
    return {
      id: group.id,
      name: group.name,
      inviteCode: group.inviteCode,
      createdAt: group.createdAt,
      members: group.members.map((m) => ({
        userId: m.user.id,
        nickname: m.user.nickname,
        joinedAt: m.joinedAt,
      })),
    };
  }
}
