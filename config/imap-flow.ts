import { ImapFlow, SearchObject } from 'imapflow';
import { DateTime } from 'luxon';

import { InputGetEmailsType, OutputGetEmailsType } from '../types/email';
import ENV from '../env';

const validatedConfig = {
  user: ENV.EMAIL_USER,
  appPassword: ENV.EMAIL_APP_PASSWORD,
};

class EmailClient {
  private client: ImapFlow;

  constructor() {
    if (!validatedConfig.user || !validatedConfig.appPassword) {
      throw new Error(
        'Email user and app password must be set in environment variables.'
      );
    }

    try {
      this.client = new ImapFlow({
        host: 'imap.gmail.com',
        port: 993,
        secure: true,
        auth: {
          user: validatedConfig.user,
          pass: validatedConfig.appPassword,
        },
      });
    } catch (error) {
      throw new Error('Failed to initialize email client');
    }
  }

  async connect() {
    await this.client.connect();
  }

  async disconnect() {
    await this.client.logout();
  }

  async fetchEmails(params: InputGetEmailsType) {
    try {
      await this.connect();
      await this.client.mailboxOpen('INBOX');

      const defaultStartDate = DateTime.now().startOf('day');

      const defaultEndDate = DateTime.now().endOf('day');

      const orConditions = [];

      if (params.senders) {
        for (const sender of params.senders) {
          orConditions.push({ from: sender });
        }
      }

      const searchCriteria: SearchObject = {
        subject: params.subject,
        since: params.dateRange?.start
          ? DateTime.fromISO(params.dateRange.start).toJSDate()
          : defaultStartDate.toJSDate(),
        before: params.dateRange?.end
          ? DateTime.fromISO(params.dateRange.end).toJSDate()
          : defaultEndDate.toJSDate(),
        or: orConditions,
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
      await this.disconnect();
      await this.client.mailboxClose();
      return { emails: [], error: 'Failed to fetch emails' };
    }
  }

  async markAsRead(emailId: number) {
    return await this.client.messageFlagsAdd([emailId], ['\\Seen'], {
      uid: true,
    });
  }
}

export default EmailClient;
