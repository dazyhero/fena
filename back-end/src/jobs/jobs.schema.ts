import { pgTable, serial, text, integer } from 'drizzle-orm/pg-core';

export const jobs = pgTable('jobs', {
  id: serial('id').primaryKey(),
  jobId: text('job_id').notNull(),
  totalEmails: integer('total_emails').notNull(),
  processed: integer('processed').notNull(),
  status: text('status').notNull(),
});

export type Job = typeof jobs.$inferSelect;
export type JobInsert = typeof jobs.$inferInsert;
