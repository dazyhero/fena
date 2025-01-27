import { Module } from '@nestjs/common';
import { JobsController } from './jobs.controller';
import { JobsService } from './jobs.service';
import { DatabaseService } from '@/database/database.service';
import { QueueService } from '@/queue/queue.service';

@Module({
  controllers: [JobsController],
  providers: [JobsService, DatabaseService, QueueService],
})
export class JobsModule {}
