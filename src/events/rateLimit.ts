import type { DevToolBot } from '../DevToolBot';
import type { RateLimitData } from 'discord.js';
import { Event } from '../interface';

export default class extends Event {
    public constructor(client: DevToolBot) {
        super(client, 'rateLimit');
    }

    public run(data: RateLimitData): void {
        this.logger.warn(data);
    }
}
