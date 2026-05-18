export class TimeBlockResponseDto {
  id: string;
  title: string;
  startTime: Date;
  endTime: Date;
  date: Date;
  isDone: boolean;
  createdAt: Date;
  videoUrl: string | null;
}
