import { DevToolBot } from '..';
import { Event } from '../interfaces';

export default class extends Event {
    public constructor(client: DevToolBot) {
        super(client, 'ready');
    }

    public run(): void {
        this.logger.info('Succesfully logged in and is Ready.');
        this.client.off('ready', (arg: void) => arg);
    }
}
