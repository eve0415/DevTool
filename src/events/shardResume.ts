import type { DevToolBot } from '../DevToolBot';
import { Event } from '../interface';

export default class extends Event {
    public constructor(client: DevToolBot) {
        super(client, 'shardResume');
    }

    public run(id: number, replayedEvents: number): void {
        this.logger.info(`Shard: ${id} has resumed. Replayed: ${replayedEvents}`);
    }
}
