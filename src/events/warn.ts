import type { DevToolBot } from '../DevToolBot';
import { Event } from '../interface';

export default class extends Event {
    public constructor(client: DevToolBot) {
        super(client, 'warn');
    }

    public run(info: string): void {
        this.logger.warn('DJS Warning -', info);
    }
}
