import { z } from 'zod';

// Auth Email Schema
export const AuthEmail = {
  email: z
    .string()
    .email()
    .describe('Email address of the user')
    .describe('Email address of the user'),
  password: z
    .string()
    .min(6)
    .describe('Password of the user')
    .describe('Password of the user'),
  clientType: z
    .enum(['gmail', 'outlook', 'yahoo'])
    .describe('Type of email client to use'),
  port: z
    .string()
    .nullish()
    .describe('Port to connect to the email server, defaults to 993 for IMAP'),
} as const;
export const AuthEmailSchema = z.object(AuthEmail);
export type AuthEmailType = z.infer<typeof AuthEmailSchema>;

// Search Email Schemas
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
      start: z.string().optional().describe('Start date of the range'),
      end: z.string().optional().describe('End date of the range'),
    })
    .describe(
      'Date range is a dictionary with the keys "start" and "end". Must be provided on date time ISO string format.'
    ),
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

// Mark Emails as Read Schemas
export const InputMarkEmailsAsRead = {
  ids: z.array(z.number()).describe('Array of email IDs to mark as read'),
} as const;
const InputMarkEmailsAsReadSchema = z.object(InputMarkEmailsAsRead);
export type InputMarkEmailsAsReadType = z.infer<
  typeof InputMarkEmailsAsReadSchema
>;

export const OutputMarkEmailsAsRead = {
  success: z.boolean(),
  error: z.string().nullish(),
} as const;
const OutputMarkEmailsAsReadSchema = z.object(OutputMarkEmailsAsRead);
export type OutputMarkEmailsAsReadType = z.infer<
  typeof OutputMarkEmailsAsReadSchema
>;
