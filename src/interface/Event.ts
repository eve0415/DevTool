import { basename } from 'path';
import { getLogger, Logger } from 'log4js';
import { DevToolBot } from '../DevToolBot';

export abstract class Event {
    protected readonly logger: Logger;
    public readonly name: string;

    protected constructor(
        protected readonly client: DevToolBot,
        readonly fileName: string,
        public readonly once = false,
    ) {
        const name = basename(fileName).split('.').filter(f => !['ts', 'js'].includes(f)).join('.');
        this.name = name;
        this.logger = getLogger(name);
    }

    public abstract run(...args: unknown[]): void;
}
