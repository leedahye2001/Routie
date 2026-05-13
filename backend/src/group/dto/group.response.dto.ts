export class GroupMemberDto {
  userId: string;
  nickname: string;
  joinedAt: Date;
}

export class GroupResponseDto {
  id: string;
  name: string;
  inviteCode: string;
  createdAt: Date;
  members: GroupMemberDto[];
}

export class GroupSummaryDto {
  id: string;
  name: string;
  inviteCode: string;
  memberCount: number;
}
