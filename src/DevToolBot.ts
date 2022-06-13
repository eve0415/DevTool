import { Client } from 'discord.js';
import fastify from 'fastify';
import log4js from 'log4js';
import { CommandManager } from './manager';

const { getLogger } = log4js;

export class DevToolBot extends Client {
    private readonly logger = getLogger('DevToolBot');
    private readonly fastify = fastify();
    private _ready = false;

    public readonly commandManager: CommandManager;

    public constructor() {
        super({
            intents: ['GUILDS', 'GUILD_MESSAGES'],
            partials: ['MESSAGE'],
            restTimeOffset: 0,
            allowedMentions: { repliedUser: false },
            http: { api: 'https://canary.discord.com/api' },
        });

        getLogger().level = process.env['NODE_ENV'] ? 'trace' : 'info';

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

        await import('./events/error').then(i => this.on('error', arg => new i.default(this).run(arg)));
        await import('./events/interactionCreate').then(i => this.on('interactionCreate', arg => new i.default(this).run(arg)));
        await import('./events/messageCreate').then(i => this.on('messageCreate', arg => new i.default(this).run(arg)));
        await import('./events/rateLimit').then(i => this.on('rateLimit', arg => new i.default(this).run(arg)));
        await import('./events/ready').then(i => this.once('ready', arg => new i.default(this).run(arg)));
        await import('./events/shardDisconnect').then(i => this.on('shardDisconnect', (...arg) => new i.default(this).run(...arg)));
        await import('./events/shardError').then(i => this.on('shardError', (...arg) => new i.default(this).run(...arg)));
        await import('./events/shardReady').then(i => this.on('shardReady', (...arg) => new i.default(this).run(...arg)));
        await import('./events/shardReconnecting').then(i => this.on('shardReconnecting', arg => new i.default(this).run(arg)));
        await import('./events/shardResume').then(i => this.on('shardResume', (...arg) => new i.default(this).run(...arg)));
        await import('./events/warn').then(i => this.on('warn', arg => new i.default(this).run(arg)));

        await this.commandManager.registerAll().catch(e => this.logger.error(e));

        this.logger.info('Initialize done. Logging in...');

        await super.login().catch(e => this.logger.error(e));

        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore:next-line
        delete process.env.DISCORD_TOKEN;
    }

    public async shutdown(): Promise<void> {
        this.logger.info('Shutting down...');

        this.ready = false;

        this.removeAllListeners();
        await new Promise(resolve => setTimeout(resolve, 5000));

        this.destroy();
        this.fastify.server.close();

        process.exit();
    }

    private setUp(): void {
        this.fastify.get('/healtz', (_, rep) => {
            rep.code(this._ready ? 200 : 503).send();
        });
        this.fastify.listen({ port: 8080, host: '0.0.0.0' });
    }
}
