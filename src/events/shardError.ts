import type { DevToolBot } from '../DevToolBot';
import { Event } from '../interface';

export default class extends Event {
    public constructor(client: DevToolBot) {
        super(client, 'shardError');
    }

    public run(error: Error, id: number): void {
        this.logger.info(`Shard: ${id} has occured an error.`, error);
    }
}
