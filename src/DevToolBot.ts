import { Client } from 'discord.js';
import { getLogger } from 'log4js';
import { CommandManager, EventManager } from './manager';

export class DevToolBot extends Client {
    private readonly logger = getLogger('DevToolBot');
    private readonly eventManager: EventManager;

    public readonly commandManager: CommandManager;

    public constructor() {
        super({
            intents: ['GUILDS'],
            restTimeOffset: 0,
            allowedMentions: { repliedUser: false },
            http: { api: 'https://canary.discord.com/api' },
        });

        getLogger().level = process.env.NODE_ENV ? 'trace' : 'info';

        this.eventManager = new EventManager(this);
        this.commandManager = new CommandManager(this);
    }

    public async start(): Promise<void> {
        this.logger.info('Initializing...');

        await this.eventManager.registerAll().catch(e => this.logger.error(e));
        await this.commandManager.registerAll().catch(e => this.logger.error(e));
        // await this.interactionManager.registerAll().catch(e => this.logger.error(e));

        this.logger.info('Initialize done. Logging in...');

        await super.login().catch(e => this.logger.error(e));
        delete process.env.DISCORD_TOKEN;
    }
}
