import type { DevToolBot } from '../DevToolBot';
import { Event } from '../interface';

export default class extends Event {
    public constructor(client: DevToolBot) {
        super(client, 'debug');
    }

    public run(message: string): void {
        this.logger.debug('DJS Debug -', message);
    }
}
