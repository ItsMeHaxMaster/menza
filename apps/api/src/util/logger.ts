import chalk from 'chalk';

export enum Level {
  Debug,
  Info,
  Warning,
  Error,
  None
}

export default class Logger {
  private type: string;
  private level: Level;

  constructor(type: string, level: Level = Level.Info) {
    this.type = type;
    this.level = level;
  }

  debug(...message: unknown[]) {
    const time = new Date().toISOString();

    if (this.level > Level.Debug) return;
    console.log(
      `[${chalk.grey(time)} ${chalk.blue('DEBUG')} ${this.type}]`,
      ...message
    );
  }

  info(...message: unknown[]) {
    const time = new Date().toISOString();

    if (this.level > Level.Info) return;
    console.log(
      `[${chalk.grey(time)} ${chalk.green('INFO')} ${this.type}]`,
      ...message
    );
  }

  warn(...message: unknown[]) {
    const time = new Date().toISOString();

    if (this.level > Level.Warning) return;
    console.log(
      `[${chalk.grey(time)} ${chalk.yellow('WARN')} ${this.type}]`,
      ...message
    );
  }

  error(...message: unknown[]) {
    const time = new Date().toISOString();

    if (this.level > Level.Error) return;
    console.log(
      `[${chalk.grey(time)} ${chalk.red('ERROR')} ${this.type}]`,
      ...message
    );
  }
}
