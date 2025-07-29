import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

import EmailClient from '../config/email-client';

import {
  AuthEmailType,
  InputGetEmails,
  InputMarkEmailsAsRead,
  OutputGetEmails,
  OutputMarkEmailsAsRead,
} from '../types/email';

import type {
  InputGetEmailsType,
  OutputGetEmailsType,
  InputMarkEmailsAsReadType,
} from '../types/email';
import { FETCH_EMAILS_PROMPT } from '../constants/email';
import { Logger } from '../utils/logger';

const fetchEmailsHandler = async (
  params: InputGetEmailsType,
  authEmail: AuthEmailType
): Promise<OutputGetEmailsType> => {
  try {
    const emailClient = new EmailClient(authEmail);

    return await emailClient.fetchEmails(params);
  } catch (error) {
    return {
      emails: [],
      error: `Failed to fetch emails: ${
        error instanceof Error ? error.message : 'Unknown error'
      }`,
    };
  }
};

const markEmailsAsReadHandler = async (
  params: InputMarkEmailsAsReadType,
  authEmail: AuthEmailType
): Promise<{ success: boolean; error?: string }> => {
  try {
    const emailClient = new EmailClient(authEmail);

    await emailClient.markEmailsAsRead(params);

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: `Failed to mark emails as read: ${
        error instanceof Error ? error.message : 'Unknown error'
      }`,
    };
  }
};

const parseResponsePrompt = (response: OutputGetEmailsType, prompt: string) => {
  if (!response.emails || response.emails.length === 0) {
    return 'No emails found matching the criteria.';
  }

  const emailsContent = prompt.replace(
    '{{emails}}',
    JSON.stringify(response.emails)
  );

  return emailsContent;
};

export function registerEmailServices(server: McpServer) {
  server.registerTool(
    'search-emails',
    {
      title: 'Get Emails',
      description:
        "Get emails from the user's inbox. Can specify the mailbox (INBOX by default), a subject (string), date range (ISO format: YYYY-MM-DDTHH:mm:ss), and sender emails (list of strings) to filter emails.",
      annotations: {
        destructiveHint: false,
        idempotentHint: false,
        openWorldHint: false,
        readOnlyHint: true,
        title: 'Get Emails',
        params: {
          subject: {
            type: 'string',
            description:
              'Optional subject to filter emails by subject or sender. Only sent if user provides a subject to search EXPLICITLY!',
          },
          dateRange: {
            type: 'object',
            description: 'Optional date range to filter emails',
            properties: {
              start: {
                type: 'string',
                format: 'date-time',
                description:
                  'Start date of the range, format YYYY-MM-DDTHH:mm:ss',
              },
              end: {
                type: 'string',
                format: 'date-time',
                description:
                  'End date of the range, format YYYY-MM-DDTHH:mm:ss',
              },
            },
            required: ['start', 'end'],
          },
          sender: {
            type: 'string',
            description: 'Optional sender email to filter emails',
          },
        },
      },
      inputSchema: InputGetEmails,
      outputSchema: OutputGetEmails,
    },
    async (params, { requestInfo }) => {
      const authEmail = {
        port: requestInfo?.headers['email-port'],
        email: requestInfo?.headers['email-username'],
        password: requestInfo?.headers['email-password'],
        clientType: requestInfo?.headers['email-client-type'],
      } as AuthEmailType;

      const responseEmails = await fetchEmailsHandler(params, authEmail);

      Logger.debug(
        'Received emails response:',
        JSON.stringify(responseEmails, null, 2)
      );

      if (responseEmails.error) {
        return {
          content: [
            {
              type: 'text',
              text: responseEmails.error,
            },
          ],
          structuredContent: responseEmails,
          isError: true,
        };
      }

      if (!responseEmails.emails || responseEmails.emails.length === 0) {
        return {
          content: [
            {
              type: 'text',
              text: 'No emails found matching the criteria.',
            },
          ],
          structuredContent: responseEmails,
        };
      }

      const finalPrompt =
        (requestInfo?.headers['email-prompt'] as string) ||
        process.env.EMAIL_PROMPT ||
        FETCH_EMAILS_PROMPT;

      Logger.debug(
        'Prompt sources:',
        JSON.stringify({
          header: requestInfo?.headers['email-prompt'],
          env: process.env.EMAIL_PROMPT,
          final: finalPrompt,
        })
      );

      Logger.debug('Using prompt for email summarization:', finalPrompt);

      const finalResponse = parseResponsePrompt(responseEmails, finalPrompt);
      return {
        content: [
          {
            type: 'text',
            text: finalResponse,
          },
        ],
        structuredContent: responseEmails,
      };
    }
  );

  server.registerTool(
    'mark-emails-as-read',
    {
      title: 'Mark Emails as Read',
      description: "Mark specified emails as read in the user's inbox.",
      inputSchema: InputMarkEmailsAsRead,
      outputSchema: OutputMarkEmailsAsRead,
    },
    async (params, { requestInfo }) => {
      const authEmail = {
        port: requestInfo?.headers['email-port'],
        email: requestInfo?.headers['email-username'],
        password: requestInfo?.headers['email-password'],
        clientType: requestInfo?.headers['email-client-type'],
      } as AuthEmailType;

      const result = await markEmailsAsReadHandler(params, authEmail);

      return {
        content: [
          {
            type: 'text',
            text: result.success
              ? 'Emails marked as read successfully.'
              : `Failed to mark emails as read: ${result.error}`,
          },
        ],
        structuredContent: result,
        isError: !result.success,
      };
    }
  );
}
