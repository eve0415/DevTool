import type { DevToolBot } from '../DevToolBot';
import { readdirSync } from 'fs';
import { resolve } from 'path';
import { Collection } from 'discord.js';
import { getLogger } from 'log4js';
import { Command } from '../interface';

export class CommandManager extends Collection<string, Command> {
    private readonly logger = getLogger('CommandManager');

    public constructor(private readonly client: DevToolBot) {
        super();
    }

    public register(command: Command): void {
        this.logger.info(`Registering command: ${command.data.name}`);
        if (this.has(command.data.name)) {
            this.logger.error(`Command name ${command.data.name} is already registered`);
            throw new Error(`Command name ${command.data.name} is already registered`);
        }
        this.set(command.data.name, command);
    }

    public async registerAll(): Promise<void> {
        this.logger.info('Starting to register all commands');
        const dir = resolve(`${__dirname}/../command`);
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return,@typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access
        const modules = await Promise.all(readdirSync(dir).filter(file => /.js|.ts/.exec(file)).map(file => import(`${dir}/${file}`).then(a => new a.default(this.client))));
        const commands = modules.filter<Command>((value): value is Command => value instanceof Command);
        await Promise.all(commands.map(event => this.register(event)));
        this.logger.info(`Successfully registered ${this.size} commands`);
    }

    public async subscribe(): Promise<void> {
        const subscribed = await this.client.application?.commands.fetch() ?? new Collection();

        const diffAdded = this.filter(c => !subscribed.find(s => s.name === c.data.name));
        const diffRemoved = subscribed?.filter(s => !this.find(c => s.name === c.data.name));
        const diff = this.filter(c => !(subscribed.find(s => s.name === c.data.name)?.equals(c.data) ?? false));

        for (const add of diffAdded.values()) {
            await this.client.application?.commands.create(add.data);
        }
        for (const remove of diffRemoved.values()) {
            await this.client.application?.commands.delete(remove.id);
        }
        for (const change of diff.values()) {
            await this.client.application?.commands.edit(subscribed.find(s => s.name === change.data.name)?.id as string, change.data);
        }
    }
}
