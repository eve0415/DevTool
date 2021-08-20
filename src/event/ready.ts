import { DevToolBot } from '../DevToolBot';
import { Event } from '../interface';

export default class extends Event {
    public constructor(protected readonly client: DevToolBot) {
        super(client, __filename, true);
    }

    public async run(): Promise<void> {
        this.logger.info('Succesfully logged in and is Ready.');
        this.logger.trace(`Cached ${this.client.guilds.cache.size} guild${this.client.guilds.cache.size <= 1 ? '' : 's'}`);

        this.client.ready = true;

        this.logger.info('Starting to subscribe commands to Discord Server');
        await this.client.commandManager.subscribe()
            .then(() => this.logger.info('Succesfully subscribed commands to Discord Server'))
            .catch(e => this.logger.error('There was an error subscribing', e));
    }
}
