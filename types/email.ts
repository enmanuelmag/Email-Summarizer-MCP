import { z } from 'zod';

export const InputGetEmails = {
  subject: z.string().optional(),
  dateRange: z
    .object({
      start: z.string().optional(),
      end: z.string().optional(),
    })
    .optional(),
  senders: z.array(z.string()).optional(),
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
