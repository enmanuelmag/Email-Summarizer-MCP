/* eslint-disable @typescript-eslint/no-explicit-any */
import chalk from 'chalk';
import fs from 'node:fs';

class LoggerImpl {
  private padLength = 8;

  private getPrefix() {
    return chalk.green('[Cardor MCP]');
  }

  private print(type: LogType, info: string, texts: any): void {
    const prefix = this.getPrefix();

    const STREAM_SERVER = Boolean(process.env.STREAM_SERVER);

    if (STREAM_SERVER) {
      console[type](`${prefix} ${info}`, ...texts);
      return;
    }

    const logFilePath = process.env.DEBUG_LOG_FILE || './server.log';
    const logMessage = `${new Date().toISOString()} ${info} ${texts.join(' ')}`;

    if (!fs.existsSync(logFilePath)) {
      fs.writeFileSync(logFilePath, '');
    }

    fs.appendFileSync(logFilePath, `${logMessage}\n`);
  }

  debug(...text: any): void {
    this.print(
      'debug',
      `${chalk.blueBright('[DEBUG]'.padEnd(this.padLength))}${chalk.reset(
        ' '
      )}`,
      text
    );
  }

  info(...text: Array<any>): void {
    this.print(
      'info',
      `${chalk.cyanBright('[INFO]'.padEnd(this.padLength))}${chalk.reset(' ')}`,
      text
    );
  }

  warn(...text: Array<any>): void {
    this.print(
      'warn',
      `${chalk.yellowBright('[WARN]'.padEnd(this.padLength))}${chalk.reset(
        ' '
      )}`,
      text
    );
  }

  error(...text: Array<any>): void {
    this.print(
      'error',
      `${chalk.redBright('[ERROR]'.padEnd(this.padLength))}${chalk.reset(' ')}`,
      text
    );
  }
}

export const Logger = new LoggerImpl();

export type LogType = 'error' | 'warn' | 'debug' | 'info';
