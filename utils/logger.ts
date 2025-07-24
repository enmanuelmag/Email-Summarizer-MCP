/* eslint-disable @typescript-eslint/no-explicit-any */
import chalk from 'chalk';

class LoggerImpl {
  private getPrefix() {
    return chalk.green('[Cardor MCP]');
  }

  private print(type: LogType, info: string, texts: any): void {
    const prefix = this.getPrefix();

    console[type](`${prefix} ${info}`, ...texts);
  }

  debug(...text: any): void {
    this.print(
      'debug',
      `${chalk.blueBright('[DEBUG]')}${chalk.reset(' ')}`,
      text
    );
  }

  info(...text: Array<any>): void {
    this.print(
      'info',
      `${chalk.cyanBright('[INFO]')}${chalk.reset(' ')}`,
      text
    );
  }

  warn(...text: Array<any>): void {
    this.print(
      'warn',
      `${chalk.yellowBright('[WARN]')}${chalk.reset(' ')}`,
      text
    );
  }

  error(...text: Array<any>): void {
    this.print(
      'error',
      `${chalk.redBright('[ERROR]')}${chalk.reset(' ')}`,
      text
    );
  }
}

export const Logger = new LoggerImpl();

export type LogType = 'error' | 'warn' | 'debug' | 'info';
