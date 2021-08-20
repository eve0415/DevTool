import { ApplicationCommandData } from 'discord.js';
import { getLogger, Logger } from 'log4js';
import { DevToolBot } from '../DevToolBot';

export abstract class Command {
    protected readonly logger: Logger;

    protected constructor(
        protected readonly client: DevToolBot,
        public readonly data: ApplicationCommandData,
    ) {
        this.logger = getLogger(data.name);
    }

    public abstract run(...args: unknown[]): Promise<unknown>;
}
