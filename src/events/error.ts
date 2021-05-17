import { DevToolBot } from '..';
import { Event } from '../interfaces';

export default class extends Event {
    public constructor(client: DevToolBot) {
        super(client, 'error');
    }

    public run(error: Error): void {
        this.logger.error(error);
    }
}
