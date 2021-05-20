import { Client } from 'discord.js';
import { getLogger, shutdown } from 'log4js';
import { CommandManager, EvaluationManager, EventManager } from './manager';

export class DevToolBot extends Client {
    private readonly logger = getLogger('DevToolBot');
    private fatalError = 0;
    private readonly eventManager: EventManager;
    public readonly commandManager: CommandManager;
    public readonly evalManager: EvaluationManager;

    public constructor() {
        super({
            intents: ['GUILDS', 'GUILD_MESSAGES', 'GUILD_MESSAGE_REACTIONS', 'DIRECT_MESSAGES', 'DIRECT_MESSAGE_REACTIONS'],
            restTimeOffset: 0,
        });

        getLogger().level = process.env.NODE_ENV ? 'trace' : 'info';
        this.commandManager = new CommandManager(this);
        this.eventManager = new EventManager(this);
        this.evalManager = new EvaluationManager();
    }

    public async init(): Promise<void> {
        this.logger.info('Initializing...');
        // Before doing anythig, set error handler to handle unexpected errors
        this.errorHandler();
        await this.eventManager.registerAll();
        await import('./commands');
        this.logger.info('Initialize complete');
    }

    public async start(): Promise<string> {
        await this.init();
        return super.login();
    }

    public shutdown(): void {
        shutdown();
        this.destroy();
        process.exit();
    }

    private errorHandler() {
        ['SIGTERM', 'SIGINT', 'uncaughtException', 'unhandledRejection']
            .forEach(signal => process.on(signal, e => {
                if (this.fatalError) process.exit(-1);
                if (signal === 'unhandledRejection' || signal === 'uncaughtException') {
                    this.logger.error('Unexpected error occured');
                    this.logger.error(e);
                    return;
                }
                if (!(signal === 'SIGINT' || signal === 'SIGTERM')) {
                    this.fatalError++;
                    this.logger.fatal('Unexpected error occured');
                    this.logger.fatal(e);
                }
                this.shutdown();
            }));
    }
}

export const instance = new DevToolBot();
instance.start().catch(console.error);
