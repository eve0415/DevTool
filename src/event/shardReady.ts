import { DevToolBot } from '../DevToolBot';
import { Event } from '../interface';

export default class extends Event {
    public constructor(protected readonly client: DevToolBot) {
        super(client, __filename, true);
    }

    public run(id: number, unavailableGuilds: Set<string> | undefined): void {
        const unavailable = unavailableGuilds?.size ?? 0;
        this.logger.info(`Shard: ${id} is now ready.`,
            unavailable === 0 ? '' : `${unavailable} guild${unavailable === 1 ? ' is' : 's are'} unavailable ATM`);
    }
}
