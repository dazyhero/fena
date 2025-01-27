import { Injectable } from '@nestjs/common';
import { jobs, JobInsert } from './jobs.schema';
import { eq, desc } from 'drizzle-orm';
import { DatabaseService } from '@/database/database.service';

@Injectable()
export class JobsService {
  constructor(private readonly dbService: DatabaseService) {}
  async createJob(totalEmails: number): Promise<string> {
    const jobId = `job-${Date.now()}`;
    await this.dbService.db
      .insert(jobs)
      .values({ jobId, totalEmails, processed: 0, status: 'Pending' });
    return jobId;
  }

  async updateJobProgress(updatedJob: Partial<JobInsert>): Promise<void> {
    const { jobId, processed, status } = updatedJob;
    await this.dbService.db
      .update(jobs)
      .set({ processed, status })
      .where(eq(jobs.jobId, jobId));
  }

  async getJobStatus(jobId: string): Promise<any> {
    const [job] = await this.dbService.db
      .select()
      .from(jobs)
      .where(eq(jobs.jobId, jobId));
    return job;
  }

  async getAllJobs(): Promise<any[]> {
    return this.dbService.db.select().from(jobs).orderBy(desc(jobs.id));
  }
}
