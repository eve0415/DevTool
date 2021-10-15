import type { CloseEvent } from 'discord.js';
import type { DevToolBot } from '../DevToolBot';
import { Event } from '../interface';

export default class extends Event {
    public constructor(protected override readonly client: DevToolBot) {
        super(client, __filename, true);
    }

    public run(event: CloseEvent, id: number): void {
        this.logger.info(`Shard: ${id} has disconnected.`, `Code: ${event.code}, Reason: ${event.reason}`);
    }
}
