import { ImapFlow, SearchObject } from 'imapflow';
import { DateTime } from 'luxon';

import {
  AuthEmailType,
  InputGetEmailsType,
  InputMarkEmailsAsReadType,
  OutputGetEmailsType,
} from '../types/email';
import { handleError } from '../decorators/handle-error';
import { Logger } from '../utils/logger';

class EmailClient {
  private email: string;
  private password: string;
  private clientType: AuthEmailType['clientType'];

  constructor(params: AuthEmailType) {
    this.email = params.email || process.env.EMAIL_USERNAME || '';
    this.password = params.password || process.env.EMAIL_PASSWORD || '';
    this.clientType = (process.env.EMAIL_CLIENT_TYPE ||
      params.clientType) as AuthEmailType['clientType'];

    // try {
    //   const { host, port } = this.getHost(
    //     (process.env.EMAIL_CLIENT_TYPE as AuthEmailType['clientType']) ||
    //       params.clientType
    //   );

    //   this.client = new ImapFlow({
    //     host,
    //     secure: true,
    //     emitLogs: false,
    //     logger: undefined,
    //     port: process.env.EMAIL_PORT
    //       ? parseInt(process.env.EMAIL_PORT, 10)
    //       : port,
    //     auth: {
    //       user: process.env.EMAIL_USERNAME || params.email,
    //       pass: process.env.EMAIL_PASSWORD || params.password,
    //     },
    //   });
    // } catch (error) {
    //   throw new Error(
    //     `Fail INIT ${error instanceof Error ? error.message : 'Unknown error'}`
    //   );
    // }
  }

  private getClient() {
    const { host, port } = this.getHost(this.clientType);

    const client = new ImapFlow({
      host,
      secure: true,
      emitLogs: false,
      logger: undefined,
      port: process.env.EMAIL_PORT
        ? parseInt(process.env.EMAIL_PORT, 10)
        : port,
      auth: {
        user: this.email,
        pass: this.password,
      },
    });

    return client;
  }

  private getHost(clientType: AuthEmailType['clientType']) {
    switch (clientType) {
      case 'gmail':
        return {
          host: 'imap.gmail.com',
          port: 993,
        };
      case 'outlook':
        return {
          host: 'outlook.office365.com',
          port: 993,
        };
      case 'yahoo':
        return {
          host: 'imap.mail.yahoo.com',
          port: 993,
        };
      default:
        throw new Error(`Unsupported email client type: ${clientType}`);
    }
  }

  @handleError('Failed to fetch emails')
  async fetchEmails(params: InputGetEmailsType) {
    const client = this.getClient();
    try {
      await client.connect();
      await client.mailboxOpen(params.mailbox || 'INBOX');

      const defaultStartDate = DateTime.now().startOf('day');

      const defaultEndDate = DateTime.now().endOf('day');

      const orConditions: Array<{ from: string }> = [];

      if (params.senders) {
        for (const sender of params.senders) {
          orConditions.push({ from: sender });
        }
      }

      const localTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

      if (params.dateRange.start) {
        params.dateRange.start = params.dateRange.start.replace(
          /Z|GMT-[0-9]+/g,
          ''
        );
        //if no time is provided, set to start of day
        if (!params.dateRange.start.includes('T')) {
          params.dateRange.start += 'T00:00:00';
        }
      }
      if (params.dateRange.end) {
        params.dateRange.end = params.dateRange.end.replace(
          /Z|GMT-[0-9]+/g,
          ''
        );
        //if no time is provided, set to end of day
        if (!params.dateRange.end.includes('T')) {
          params.dateRange.end += 'T23:59:59';
        }
      }

      let sinceDate = params.dateRange?.start
        ? DateTime.fromISO(params.dateRange.start)
        : defaultStartDate;

      let beforeDate = params.dateRange?.end
        ? DateTime.fromISO(params.dateRange.end)
        : defaultEndDate;

      if (params.dateRange.start) {
        sinceDate = sinceDate.setZone(localTimezone, { keepLocalTime: true });
      }
      if (params.dateRange.end) {
        beforeDate = beforeDate.setZone(localTimezone, { keepLocalTime: true });
      }

      const searchCriteria: SearchObject = {
        subject: params.subject,
        since: sinceDate.toJSDate()!,
        before: beforeDate.toJSDate()!,
        or: orConditions.length > 0 ? orConditions : undefined,
      };

      Logger.debug(
        'Searching emails with criteria:',
        JSON.stringify(searchCriteria, null, 2)
      );

      const messagesUIDs = await client.search(searchCriteria, {
        uid: true,
      });

      if (!messagesUIDs) {
        return {
          emails: [],
          error: 'No emails found matching the criteria.',
        };
      }

      Logger.debug(`Found ${messagesUIDs.length} emails matching the criteria`);

      const emailsParsed: OutputGetEmailsType['emails'] = [];

      for (const messageUID of messagesUIDs) {
        const message = await client.fetchOne(
          messageUID,
          {
            uid: true,
            envelope: true,
            bodyStructure: true,
          },
          {
            uid: true,
          }
        );

        if (!message) {
          continue;
        }

        if (message.envelope?.date) {
          const emailDate = DateTime.fromJSDate(message.envelope.date);

          const isInRange = emailDate >= sinceDate && emailDate < beforeDate;
          if (!isInRange) {
            continue;
          }
        }

        const senderParsed =
          message.envelope?.sender
            ?.map((s) => {
              const { address, name } = s;
              return name ? `${name} <${address}>` : address;
            })
            .join(', ') || 'Unknown Sender';

        emailsParsed.push({
          id: messageUID,
          subject: message.envelope?.subject || 'No Subject',
          sender: senderParsed,
          snippet: '',
          date: message.envelope?.date
            ? DateTime.fromJSDate(message.envelope.date).toISO()
            : undefined,
        });
      }

      Logger.info(`Parsed ${emailsParsed.length} emails successfully`);

      return {
        emails: emailsParsed,
      };
    } catch (error) {
      Logger.error(
        'Error fetching emails:',
        error instanceof Error ? error.message : 'Unknown error'
      );
      return { emails: [], error: 'Failed to fetch emails' };
    } finally {
      await client.mailboxClose();
      await client.logout();
    }
  }

  @handleError('Failed to mark emails as read')
  async markEmailsAsRead(params: InputMarkEmailsAsReadType) {
    const { ids } = params;

    const client = this.getClient();

    try {
      await client.connect();
      await client.mailboxOpen(params.mailbox || 'INBOX');

      await client.messageFlagsAdd(ids, ['\\Seen'], {
        uid: true,
      });
    } catch (error) {
      return {
        success: false,
        error: `Failed to mark emails as read: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`,
      };
    } finally {
      await client.mailboxClose();
      await client.logout();
    }
  }
}

export default EmailClient;
