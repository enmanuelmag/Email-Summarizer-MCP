import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

import EmailClient from '../config/email-client';

import {
  AuthEmailType,
  InputGetEmails,
  OutputGetEmails,
  type InputGetEmailsType,
  type OutputGetEmailsType,
} from '../types/email';

const getEmailHandler = async (
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

export function registerEmailServices(server: McpServer) {
  server.registerTool(
    'search-emails',
    {
      title: 'Get Emails',
      description:
        "Get emails from the user's inbox. Can specify a subject, date range, or sender to filter results.",
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
                description: 'Start date of the range',
              },
              end: {
                type: 'string',
                format: 'date-time',
                description: 'End date of the range',
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
        port: process.env.EMAIL_PORT || requestInfo?.headers['email-port'],
        email:
          process.env.EMAIL_USERNAME || requestInfo?.headers['email-username'],
        password:
          process.env.EMAIL_PASSWORD || requestInfo?.headers['email-password'],
        clientType:
          process.env.EMAIL_CLIENT_TYPE ||
          requestInfo?.headers['email-client-type'] ||
          'gmail',
      } as AuthEmailType;

      const response = await getEmailHandler(params, authEmail);

      const emailsPrompt = `
      Metadata: ${JSON.stringify(authEmail)}
      Please summarize the following emails in a table format, the columns should include:
      - Subject
      - Sender
      - Date
      - Snippet

      Only show at most 6 emails in the table. If just mention the amount of emails that was not listed.

      Here are the emails:
      ${JSON.stringify(response)}
      `;
      return {
        content: [
          {
            type: 'text',
            text: emailsPrompt,
          },
        ],
        structuredContent: response,
      };
    }
  );

  // server.registerPrompt(
  //   'get-emails-prompt',
  //   {
  //     title: 'Get Emails Prompt',
  //     description:
  //       'Prompt to get emails from the user. Can specify a subject, date range, or sender to filter results.',
  //     argsSchema: {
  //       emailsText: z.string().describe('Text containing email details'),
  //     },
  //   },
  //   ({ emailsText }) => {
  //     const emailsPrompt = `
  //     Please summarize the following emails in a table format, the columns should include:
  //     - Subject
  //     - Sender
  //     - Date
  //     - Snippet

  //     Only show at most 6 emails in the table. If just mention the amount of emails that was not listed.

  //     Here are the emails:
  //     ${emailsText}
  //     `;
  //     return {
  //       messages: [
  //         {
  //           role: 'user',
  //           content: {
  //             type: 'text',
  //             text: emailsPrompt,
  //           },
  //         },
  //       ],
  //     };
  //   }
  // );
}
