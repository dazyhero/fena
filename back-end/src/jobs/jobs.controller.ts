import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Header,
  Res,
} from '@nestjs/common';
import { JobsService } from './jobs.service';
import { QueueService } from '../queue/queue.service';
import { Response } from 'express';

@Controller('jobs')
export class JobsController {
  constructor(
    private readonly jobsService: JobsService,
    private readonly queueService: QueueService,
  ) {}

  @Post()
  async createJob(
    @Body() body: { totalEmails: number },
  ): Promise<{ jobId: string }> {
    const jobId = await this.jobsService.createJob(body.totalEmails);
    await this.queueService.addToQueue(jobId, body.totalEmails);
    return { jobId };
  }

  @Get(':id')
  async getJob(@Param('id') jobId: string) {
    return this.jobsService.getJobStatus(jobId);
  }

  @Get(':id/progress')
  @Header('Content-Type', 'text/event-stream')
  @Header('Cache-Control', 'no-cache')
  @Header('Connection', 'keep-alive')
  async getJobProgress(@Param('id') jobId: string, @Res() res: Response) {
    res.setHeader('X-Accel-Buffering', 'no');

    const interval = setInterval(async () => {
      const job = await this.jobsService.getJobStatus(jobId);

      if (!job) {
        res.write(`data: ${JSON.stringify({ error: 'Job not found' })}\n\n`);
        clearInterval(interval);
        res.end();
        return;
      }

      const progress = {
        jobId: job.jobId,
        processed: job.processed,
        total: job.totalEmails,
        status: job.status,
        percentage: Math.round((job.processed / job.totalEmails) * 100),
      };

      res.write(`data: ${JSON.stringify(progress)}\n\n`);

      if (job.status === 'Completed' || job.status === 'Failed') {
        clearInterval(interval);
        res.end();
      }
    }, 1000);

    res.on('close', () => {
      clearInterval(interval);
    });
  }

  @Get()
  async getJobs() {
    return this.jobsService.getAllJobs();
  }
}
