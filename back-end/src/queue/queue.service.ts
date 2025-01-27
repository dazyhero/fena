import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import {
  SQSClient,
  SendMessageCommand,
  ReceiveMessageCommand,
  DeleteMessageCommand,
  ChangeMessageVisibilityCommand,
} from '@aws-sdk/client-sqs';
import { JobsService } from '../jobs/jobs.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class QueueService implements OnModuleInit {
  private readonly logger = new Logger(QueueService.name);

  private readonly sqsClient: SQSClient;
  private readonly queueUrl: string;
  private readonly processingJobs: Map<string, boolean> = new Map();

  constructor(
    private readonly jobsService: JobsService,
    private readonly configService: ConfigService,
  ) {
    this.sqsClient = new SQSClient({
      region: this.configService.get('SQS_REGION'),
      credentials: {
        accessKeyId: this.configService.get('AWS_ACCESS_KEY_ID'),
        secretAccessKey: this.configService.get('AWS_SECRET_ACCESS_KEY'),
      },
    });
    this.queueUrl = this.configService.get('SQS_URL');
  }

  async onModuleInit() {
    setInterval(() => this.consumeMessages(), 5000);
  }

  private async extendVisibilityTimeout(
    receiptHandle: string,
    timeout: number,
  ) {
    await this.sqsClient.send(
      new ChangeMessageVisibilityCommand({
        QueueUrl: this.queueUrl,
        ReceiptHandle: receiptHandle,
        VisibilityTimeout: timeout,
      }),
    );
  }

  async addToQueue(jobId: string, totalEmails: number) {
    const params = {
      QueueUrl: this.queueUrl,
      MessageBody: JSON.stringify({ jobId, totalEmails }),
    };
    await this.sqsClient.send(new SendMessageCommand(params));
    this.logger.debug(`Job ${jobId} added to the queue.`);
  }

  private async consumeMessages() {
    const params = {
      QueueUrl: this.queueUrl,
      MaxNumberOfMessages: 10,
      WaitTimeSeconds: 5,
    };
    const response = await this.sqsClient.send(
      new ReceiveMessageCommand(params),
    );

    if (response.Messages) {
      for (const message of response.Messages) {
        const body = JSON.parse(message.Body);
        const jobId = body.jobId;
        if (this.processingJobs.has(jobId)) {
          continue;
        }
        this.processingJobs.set(jobId, true);
        try {
          await this.processJob(
            body.jobId,
            body.totalEmails,
            message.ReceiptHandle,
          );

          await this.sqsClient.send(
            new DeleteMessageCommand({
              QueueUrl: this.queueUrl,
              ReceiptHandle: message.ReceiptHandle,
            }),
          );
        } finally {
          this.processingJobs.delete(jobId);
        }
      }
    }
  }

  private async processJob(
    jobId: string,
    totalEmails: number,
    receiptHandle: string,
  ) {
    const job = await this.jobsService.getJobStatus(jobId);
    let processed = job.processed;

    while (processed < totalEmails) {
      const batch = Math.min(1000, totalEmails - processed);
      processed += batch;

      await this.extendVisibilityTimeout(receiptHandle, 60);

      await new Promise((resolve) => setTimeout(resolve, 1000));

      await this.jobsService.updateJobProgress({
        jobId,
        processed,
        status: 'In Progress',
      });
      this.logger.debug(
        `Processed ${processed}/${totalEmails} emails for Job ID ${jobId}`,
      );
    }

    await this.jobsService.updateJobProgress({
      jobId,
      totalEmails,
      status: 'Completed',
    });
    this.logger.debug(`Job ${jobId} completed.`);
  }
}
