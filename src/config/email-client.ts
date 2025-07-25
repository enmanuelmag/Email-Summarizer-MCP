import { ImapFlow, SearchObject } from 'imapflow';
import { DateTime } from 'luxon';

import {
  AuthEmailType,
  InputGetEmailsType,
  InputMarkEmailsAsReadType,
  OutputGetEmailsType,
} from '../types/email';
import { handleError } from '../decorators/handle-error';

class EmailClient {
  private client: ImapFlow;

  constructor(params: AuthEmailType) {
    try {
      const { host, port } = this.getHost(
        (process.env.EMAIL_CLIENT_TYPE as AuthEmailType['clientType']) ||
          params.clientType
      );

      this.client = new ImapFlow({
        host,
        secure: true,
        emitLogs: false,
        logger: undefined,
        port: process.env.EMAIL_PORT
          ? parseInt(process.env.EMAIL_PORT, 10)
          : port,
        auth: {
          user: process.env.EMAIL_USERNAME || params.email,
          pass: process.env.EMAIL_PASSWORD || params.password,
        },
      });
    } catch (error) {
      throw new Error(
        `Fail INIT ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
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
        throw new Error('Unsupported email client type');
    }
  }

  private async connect() {
    await this.client.connect();
  }

  private async disconnect() {
    await this.client.logout();
  }

  @handleError('Failed to fetch emails')
  async fetchEmails(params: InputGetEmailsType) {
    try {
      await this.connect();
      await this.client.mailboxOpen(params.mailbox || 'INBOX');

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
      }
      if (params.dateRange.end) {
        params.dateRange.end = params.dateRange.end.replace(
          /Z|GMT-[0-9]+/g,
          ''
        );
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

      const messagesUIDs = await this.client.search(searchCriteria, {
        uid: true,
      });

      if (!messagesUIDs) {
        return {
          emails: [],
          error: 'No emails found matching the criteria.',
        };
      }

      const emailsParsed: OutputGetEmailsType['emails'] = [];

      for (const messageUID of messagesUIDs) {
        const message = await this.client.fetchOne(
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

      return {
        emails: emailsParsed,
      };
    } catch (error) {
      return { emails: [], error: 'Failed to fetch emails' };
    } finally {
      await this.disconnect();
      await this.client.mailboxClose();
    }
  }

  @handleError('Failed to mark emails as read')
  async markEmailsAsRead(params: InputMarkEmailsAsReadType) {
    const { ids } = params;

    try {
      await this.connect();
      await this.client.mailboxOpen('INBOX');

      await this.client.messageFlagsAdd(ids, ['\\Seen'], {
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
      await this.disconnect();
      await this.client.mailboxClose();
    }
  }
}

export default EmailClient;
