import { DevToolBot } from '..';
import { Event } from '../interfaces';

export default class extends Event {
    public constructor(client: DevToolBot) {
        super(client, 'warn');
    }

    public run(info: string): void {
        this.logger.warn(info);
    }
}
