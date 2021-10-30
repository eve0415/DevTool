import type { ApplicationCommandData, AutocompleteInteraction, Interaction } from 'discord.js';
import type { Logger } from 'log4js';
import { getLogger } from 'log4js';
import type { DevToolBot } from '../DevToolBot';

export abstract class Command {
    protected readonly logger: Logger;

    protected constructor(
        protected readonly client: DevToolBot,
        public readonly data: ApplicationCommandData,
    ) {
        this.logger = getLogger(data.name);
    }

    public abstract run(interaction: Interaction): Promise<unknown>;

    public abstract autoCompletion(interaction: AutocompleteInteraction): Promise<unknown>;
}
