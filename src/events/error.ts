import type { DevToolBot } from '../DevToolBot';
import { Event } from '../interface';

export default class extends Event {
  public constructor(client: DevToolBot) {
    super(client, 'error');
  }

  public run(error: Error): void {
    this.logger.error('DJS Error -', error);
  }
}
