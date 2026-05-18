import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { TimeBlockQueryRepository } from './repository/time-block.query.repository';
import { TimeBlockCommandRepository } from './repository/time-block.command.repository';
import { CreateTimeBlockDto } from './dto/create-time-block.dto';
import { UpdateTimeBlockDto } from './dto/update-time-block.dto';
import { TimeBlockResponseDto } from './dto/time-block.response.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TimeBlockService {
  constructor(
    private readonly timeBlockQuery: TimeBlockQueryRepository,
    private readonly timeBlockCommand: TimeBlockCommandRepository,
    private readonly prisma: PrismaService,
  ) {}

  async create(userId: string, dto: CreateTimeBlockDto): Promise<TimeBlockResponseDto> {
    const startTime = new Date(dto.startTime);
    const endTime = new Date(dto.endTime);

    if (endTime <= startTime) {
      throw new BadRequestException('종료 시간은 시작 시간보다 늦어야 합니다.');
    }

    const block = await this.timeBlockCommand.create({
      userId,
      title: dto.title,
      startTime,
      endTime,
      date: new Date(dto.date),
    });

    return { ...block, videoUrl: null };
  }

  async findByDate(userId: string, date: string): Promise<TimeBlockResponseDto[]> {
    const blocks = await this.timeBlockQuery.findByDate(userId, new Date(date));
    return blocks.map((b) => ({ ...b, videoUrl: b.video?.s3Url ?? null }));
  }

  async update(userId: string, id: string, dto: UpdateTimeBlockDto): Promise<TimeBlockResponseDto> {
    const block = await this.timeBlockQuery.findById(id, userId);
    if (!block) throw new NotFoundException('타임블록을 찾을 수 없습니다.');

    const updated = await this.timeBlockCommand.update(id, {
      title: dto.title,
      startTime: dto.startTime ? new Date(dto.startTime) : undefined,
      endTime: dto.endTime ? new Date(dto.endTime) : undefined,
      date: dto.date ? new Date(dto.date) : undefined,
    });

    return { ...updated, videoUrl: block.video?.s3Url ?? null };
  }

  async markDone(userId: string, id: string) {
    const block = await this.timeBlockQuery.findById(id, userId);
    if (!block) throw new NotFoundException('타임블록을 찾을 수 없습니다.');

    return this.timeBlockCommand.markDone(id);
  }

  async delete(userId: string, id: string): Promise<void> {
    const block = await this.timeBlockQuery.findById(id, userId);
    if (!block) throw new NotFoundException('타임블록을 찾을 수 없습니다.');

    await this.timeBlockCommand.delete(id);
  }
}
