import { Client } from 'discord.js';
import fastify from 'fastify';
import { getLogger } from 'log4js';
import { CommandManager, EventManager } from './manager';

export class DevToolBot extends Client {
    private readonly logger = getLogger('DevToolBot');
    private readonly fastify = fastify();
    private readonly eventManager: EventManager;
    private _ready = false;

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

    public set ready(isReady: boolean) {
        this._ready = isReady;
    }

    public get ready(): boolean {
        return this._ready;
    }

    public async start(): Promise<void> {
        this.logger.info('Initializing...');

        this.setUp();

        await this.eventManager.registerAll().catch(e => this.logger.error(e));
        await this.commandManager.registerAll().catch(e => this.logger.error(e));

        this.logger.info('Initialize done. Logging in...');

        await super.login().catch(e => this.logger.error(e));
        delete process.env.DISCORD_TOKEN;
    }

    public async shutdown(): Promise<void> {
        this.logger.info('Shutting down...');

        await this.eventManager.unregisterAll().catch(e => this.logger.error(e));
        this.fastify.server.close();

        process.exit();
    }

    private setUp() {
        this.fastify.get('/healtz', (_, rep) => {
            rep.code(this._ready ? 200 : 503).send();
        });
        this.fastify.listen(8080, '0.0.0.0');
    }
}
