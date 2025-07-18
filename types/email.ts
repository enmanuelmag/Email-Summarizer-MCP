import { z } from 'zod';

export const InputGetEmails = {
  mailbox: z.string().default('INBOX').describe('Mailbox to fetch emails from'),
  subject: z
    .string()
    .optional()
    .describe(
      'Optional subject to filter emails by subject or sender. Only sent if user provides a subject to search EXPLICITLY!'
    ),
  dateRange: z
    .object({
      start: z.string().optional(),
      end: z.string().optional(),
    })
    .optional()
    .describe('Optional date range to filter emails'),
  senders: z
    .array(z.string())
    .optional()
    .describe('Optional array of email addresses to filter emails by sender'),
} as const;

const InputGetEmailsSchema = z.object(InputGetEmails);
export type InputGetEmailsType = z.infer<typeof InputGetEmailsSchema>;

export const OutputGetEmails = {
  emails: z
    .array(
      z.object({
        id: z.number(),
        subject: z.string(),
        sender: z.string(),
        snippet: z.string(),
        date: z.string().nullish(),
      })
    )
    .nullish(),
  error: z.string().nullish(),
} as const;
const OutputGetEmailsSchema = z.object(OutputGetEmails);
export type OutputGetEmailsType = z.infer<typeof OutputGetEmailsSchema>;
