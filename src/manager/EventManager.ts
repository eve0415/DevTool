import { readdirSync } from 'fs';
import { resolve } from 'path';
import { Collection } from 'discord.js';
import { getLogger } from 'log4js';
import { DevToolBot } from '..';
import { Event } from '../interfaces';

export class EventManager extends Collection<string, Event> {
    private readonly logger = getLogger('EventManager');
    private readonly client: DevToolBot;

    public constructor(client: DevToolBot) {
        super();
        this.client = client;
    }

    public register(event: Event): void {
        this.logger.info(`Registering event: ${event.name}`);
        event.client.on(event.name, event.bind);
        if (this.has(event.name)) this.logger.error(`Failed to register ${event.name} `, `${event.name} is used`);
        this.set(event.name, event);
    }

    public unregister(key: string): void {
        if (!this.has(key)) this.logger.error(`Failed to unregister ${key} `, `${key} does not exist.`);
        this.logger.info(`Unregistering event: ${this.get(key)?.name}`);
        const event = this.get(key) as Event;
        this.get(key)?.client.removeListener(event.name, event.bind);
        this.delete(key);
    }

    public async registerAll(): Promise<void> {
        this.logger.info('Trying to register all events');
        const dir = resolve(`${__dirname}/../events`);
        const modules = await Promise.all(readdirSync(dir).filter(file => /.js|.ts/.exec(file)).map(file => this.loadModule(`${dir}/${file}`)));
        const result = modules.filter<Event>((value): value is Event => value instanceof Event);
        await Promise.all(result.map(value => this.register(value)));
        this.logger.info(`Successfully registered ${this.size} Discord events`);
    }

    public unregisterAll(): Promise<unknown> {
        this.logger.info('Trying to unregister all Discord events');
        return Promise.all(this.keyArray().map(key => this.unregister(key)));
    }

    private async loadModule(absolutePath: string): Promise<unknown> {
        try {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            return create((await import(absolutePath)).default, this.client);
        } catch (e) {
            return new Error(e);
        }
    }
}

class A {}
type Type<T> = new (...args: unknown[]) => T;
const create = (ctor: Type<A>, client: DevToolBot): A => new ctor(client);
