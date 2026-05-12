import { Controller, UseGuards } from '@nestjs/common';
import { GroupService } from './group.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('groups')
export class GroupController {
  constructor(private readonly groupService: GroupService) {}
}
