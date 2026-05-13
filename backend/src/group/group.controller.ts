import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { GroupService } from './group.service';
import { CreateGroupDto } from './dto/create-group.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { AuthUser } from '../auth/strategy/jwt.strategy';

@UseGuards(JwtAuthGuard)
@Controller('groups')
export class GroupController {
  constructor(private readonly groupService: GroupService) {}

  @Post()
  createGroup(@CurrentUser() user: AuthUser, @Body() dto: CreateGroupDto) {
    return this.groupService.createGroup(user.userId, dto);
  }

  @Post('join/:inviteCode')
  joinGroup(@CurrentUser() user: AuthUser, @Param('inviteCode') inviteCode: string) {
    return this.groupService.joinGroup(user.userId, inviteCode);
  }

  @Get('me')
  getMyGroups(@CurrentUser() user: AuthUser) {
    return this.groupService.getMyGroups(user.userId);
  }

  @Get(':id')
  getGroup(@CurrentUser() user: AuthUser, @Param('id') groupId: string) {
    return this.groupService.getGroup(user.userId, groupId);
  }
}
