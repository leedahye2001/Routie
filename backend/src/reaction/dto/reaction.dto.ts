import { IsString, MaxLength } from 'class-validator';

export class AddReactionDto {
  // 이모티콘 문자열 (단일 이모티콘 또는 복합 이모티콘)
  @IsString()
  @MaxLength(8)
  emoji: string;
}

export class ReactionSummaryDto {
  // 이모티콘 종류
  emoji: string;
  // 해당 이모티콘을 누른 유저 수
  count: number;
  // 현재 로그인 유저가 이 이모티콘을 눌렀는지 여부
  reacted: boolean;
}
