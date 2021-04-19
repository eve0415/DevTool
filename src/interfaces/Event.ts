import { getLogger, Logger } from 'log4js';
import { DevToolBot } from '..';

export abstract class Event {
    protected readonly logger: Logger;
    public readonly client: DevToolBot;
    public readonly name: string;
    public readonly bind: (...args: unknown[]) => void;

    public constructor(client: DevToolBot, name: string) {
        this.client = client;
        this.name = name;
        this.logger = getLogger(name);
        this.bind = this.run.bind(this);
    }

    public abstract run (...args: unknown[]): void;
}
