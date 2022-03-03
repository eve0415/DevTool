import type { DevToolBot } from '../DevToolBot';
import { readdirSync } from 'fs';
import { resolve } from 'path';
import { Collection } from 'discord.js';
import { getLogger } from 'log4js';
import { Event } from '../interface';

export class EventManager extends Collection<string, Event> {
    private readonly logger = getLogger('EventManager(DiscordBot)');

    public constructor(private readonly client: DevToolBot) {
        super();
    }

    public register(event: Event): void {
        this.logger.info(`Registering event: ${event.name}`);
        if (this.has(event.name)) {
            this.logger.error(`Failed to register ${event.name}`);
            return this.logger.error(`${event.name} is already used. Skipping...`);
        }
        if (event.once) {
            this.client.once(event.name, event.run.bind(event));
        } else {
            this.client.on(event.name, event.run.bind(event));
        }
        this.set(event.name, event);
    }

    public unregister(key: string): void {
        if (!this.has(key)) {
            this.logger.error(`Failed to unregister ${key}`);
            this.logger.error(`${key} does not exist.`);
        }
        this.logger.info(`Unregistering event: ${this.get(key)?.name}`);
        const event = this.get(key);
        if (event) this.client.removeListener(event.name, event.run.bind(event));
        this.delete(key);
    }

    public async registerAll(): Promise<void> {
        this.logger.info('Starting to register all events');
        const dir = resolve(`${__dirname}/../event`);
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return,@typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access
        const modules = await Promise.all(readdirSync(dir).filter(file => /.js|.ts/.exec(file)).map(file => import(`${dir}/${file}`).then(a => new a.default(this.client))));
        const events = modules.filter<Event>((value): value is Event => value instanceof Event);
        await Promise.all(events.map(event => this.register(event)));
        this.logger.info(`Successfully registered ${this.size} events`);
    }

    public async unregisterAll(): Promise<void> {
        this.logger.info('Trying to unregister all events');
        await Promise.all(this.map(e => this.unregister(e.name)));
        this.logger.info(`Successfully unregistered all events`);
    }
}
