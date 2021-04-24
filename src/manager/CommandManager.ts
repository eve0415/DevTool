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

    public static register(command: Command): Command {
        return instance.commandManager.register(command);
    }

    public register(command: Command): Command {
        const user = command.madeBy === '0' ? 'System' : this.client.users.resolve(command.madeBy)?.username;
        this.commandNo++;
        this.logger.info(`[${this.commandNo}] ${user}(${command.madeBy}) has requested to register command: ${command.name}`);
        if (this.has(this.commandNo)) {
            this.logger.warn(`[${this.commandNo}] Could not register ${command.name}. It is registered by someone!`);
            throw new Error('Sorry, Could not registered the command. Try again later!');
        }
        this.set(this.commandNo, command);
        command.id = this.commandNo;
        this.logger.info(`[${this.commandNo}] Enabling command: ${command.name}....`);
        command.isEnabled = true;
        this.logger.info(`[${this.commandNo}] Successfully registered command: ${command.name}`);
        return command;
    }

    public getHelp(message: Message): void {
        const embed = new MessageEmbed()
            .setColor('BLUE')
            .setTitle('Help')
            .setDescription('Hi, thank you for using.\nThis help command will show you some commands that you can use.\nIf you need more help for any command, just send `<command name> help`.')
            .addField('System Command', this.filter(c => c.madeBy === '0').map(c => c.name).join(', '))
            .addField('Original Command', this.filter(c => c.madeBy === message.author.id || c.madeIn === message.guild?.id).map(c => c.name).concat(['None']).join(', '));

        message.reply({ embed: embed, allowedMentions: { repliedUser: false } });
    }
}
