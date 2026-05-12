import { Controller, UseGuards } from '@nestjs/common';
import { TimeBlockService } from './time-block.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('time-blocks')
export class TimeBlockController {
  constructor(private readonly timeBlockService: TimeBlockService) {}
}
