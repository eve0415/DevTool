import type { DevToolBot } from '../DevToolBot';
import { Event } from '../interface';

export default class extends Event {
    public constructor(protected override readonly client: DevToolBot) {
        super(client, __filename, true);
    }

    public run(error: Error, id: number): void {
        this.logger.info(`Shard: ${id} has occured an error.`, error);
    }
}
