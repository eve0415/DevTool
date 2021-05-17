import { DevToolBot } from '..';
import { Event } from '../interfaces';

export default class extends Event {
    public constructor(client: DevToolBot) {
        super(client, 'shardReconnecting');
    }

    public run(id: number): void {
        this.logger.info(`Shard: ${id} is now reconnecting.`);
    }
}
