import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { TimeBlockService } from './time-block.service';
import { CreateTimeBlockDto } from './dto/create-time-block.dto';
import { UpdateTimeBlockDto } from './dto/update-time-block.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { AuthUser } from '../auth/strategy/jwt.strategy';

@UseGuards(JwtAuthGuard)
@Controller('time-blocks')
export class TimeBlockController {
  constructor(private readonly timeBlockService: TimeBlockService) {}

  @Post()
  create(@CurrentUser() user: AuthUser, @Body() dto: CreateTimeBlockDto) {
    return this.timeBlockService.create(user.userId, dto);
  }

  @Get()
  findByDate(@CurrentUser() user: AuthUser, @Query('date') date: string) {
    return this.timeBlockService.findByDate(user.userId, date);
  }

  @Patch(':id')
  update(@CurrentUser() user: AuthUser, @Param('id') id: string, @Body() dto: UpdateTimeBlockDto) {
    return this.timeBlockService.update(user.userId, id, dto);
  }

  @Patch(':id/done')
  markDone(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.timeBlockService.markDone(user.userId, id);
  }

  @Delete(':id')
  @HttpCode(204)
  delete(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.timeBlockService.delete(user.userId, id);
  }
}
