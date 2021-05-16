import { Collection, Message, MessageEmbed } from 'discord.js';
import { getLogger } from 'log4js';
import { DevToolBot, instance } from '..';
import { Command } from '../interfaces';

export class CommandManager extends Collection<number, Command> {
    private readonly logger = getLogger('CommandManager');
    private readonly client: DevToolBot;
    private commandNo = 0;

    public constructor(client: DevToolBot) {
        super();
        this.client = client;
    }

    public static register(command: Command): Promise<Command> {
        return instance.commandManager.register(command);
    }

    public register(command: Command): Promise<Command> {
        const user = command.madeBy === '0' ? 'System' : this.client.users.resolve(command.madeBy)?.username;
        this.commandNo++;
        this.logger.info(`[${this.commandNo}] ${user}(${command.madeBy}) has requested to register a command: ${command.name}`);
        if (this.has(this.commandNo)) {
            this.logger.warn(`[${this.commandNo}] Could not register ${command.name}. It is registered by someone!`);
            return Promise.reject(new Error('Sorry, Could not register the command. Try again later!'));
        }
        const filtered = this.filter(c => c.madeBy === command.madeBy || c.madeIn === command.madeIn && !c.private);
        if (filtered.map(c => c.name).indexOf(command.name) >= 0 || filtered.map(c => c.name).indexOf(command.humanReadable) >= 0) {
            this.logger.warn(`[${this.commandNo}] Could not register ${command.name} because it will conflict!`);
            return Promise.reject(new Error('Sorry, Could not register the command because command name conflict with other. Try changing the command name!'));
        }
        this.set(this.commandNo, command);
        command.id = this.commandNo;
        this.logger.info(`[${this.commandNo}] Enabling command: ${command.name}....`);
        command.isEnabled = true;
        if (command.madeBy !== '0') this.countDown(command.id);
        this.logger.info(`[${this.commandNo}] Successfully registered command: ${command.name}`);
        return Promise.resolve(command);
    }

    private countDown(id: number) {
        setTimeout(() => {
            const command = this.get(id);
            if (!command || command.madeBy === '0') return;
            this.logger.info(`[${command.id}] 5 minutes passed! Disabling command: ${command.name}....`);
            command.isEnabled = false;
            setTimeout(() => {
                this.logger.info(`[${command.id}] Removing command: ${command.name}....`);
                this.delete(id);
            }, 60000);
        }, 5 * 60 * 1000);
    }

    public getHelp(message: Message): void {
        const original = (message.guild
            ? this.filter(c => c.madeBy === (message.author.id && c.madeIn === message.guild?.id) || c.madeIn === message.guild?.id && !c.private)
            : this.filter(c => c.madeBy === message.author.id))
            .filter(c => c.isEnabled)
            .map(c => c.humanReadable);
        if (!original.length) original.push('Not available');

        const embed = new MessageEmbed()
            .setColor('BLUE')
            .setTitle('Help')
            .setDescription('Hi, thank you for using.\nThis help command will show you some commands that you can use.\nIf you need more help for any command, just send `<command> help`.')
            .addField('System Command', this.filter(c => c.madeBy === '0').map(c => c.humanReadable).join(', '))
            .addField('Original Command', original.join(', '));

        message.reply({ embed: embed, allowedMentions: { repliedUser: false } });
    }
}
