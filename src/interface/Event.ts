import type { DevToolBot } from '../DevToolBot';
import type { Logger } from 'log4js';
import log4js from 'log4js';

export abstract class Event {
  protected readonly logger: Logger;

  protected constructor(
    protected readonly client: DevToolBot,
    public readonly name: string
  ) {
    this.logger = log4js.getLogger(name);
  }

  public abstract run(...args: unknown[]): void;
}
