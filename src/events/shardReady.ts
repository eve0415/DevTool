import { DevToolBot } from '..';
import { Event } from '../interfaces';

export default class extends Event {
    public constructor(client: DevToolBot) {
        super(client, 'shardReady');
    }

    public run(id: number, unavailableGuilds: Set<string> | undefined): void {
        const unavailable = unavailableGuilds?.size ?? 0;
        this.logger.info(`Shard: ${id} is now ready.`,
            unavailable === 0 ? '' : `${unavailable} guild${unavailable === 1 ? ' is' : 's are'} unavailable ATM`);
    }
}
