import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Logger,
} from '@nestjs/common';
import { Pool } from 'pg';
import { ConfigService } from '@nestjs/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from '@/jobs/jobs.schema';

@Injectable()
export class DatabaseService implements OnModuleInit, OnModuleDestroy {
  private pool: Pool;
  public db: ReturnType<typeof drizzle>;
  private readonly logger = new Logger(DatabaseService.name);

  constructor(private configService: ConfigService) {
    const connectionString = this.configService.get('POSTGRES_URL');
    this.pool = new Pool({
      connectionString,
      ssl: {
        rejectUnauthorized: false,
      },
    });
    this.db = drizzle(this.pool, { schema });
    this.logger.debug('DrizzleService initialized with connection string');
  }

  async onModuleInit() {
    await this.pool.connect();
  }

  async onModuleDestroy() {
    await this.pool.end();
  }
}
