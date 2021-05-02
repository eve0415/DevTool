import { Message, MessageEmbed } from 'discord.js';
import { DevToolBot } from '..';
import { Command, Event } from '../interfaces';

export default class extends Event {
    public constructor(client: DevToolBot) {
        super(client, 'message');
    }

    public run(message: Message): unknown {
        if (message.system || message.author.bot) return;

        const prefixMention = new RegExp(`<@!?${this.client.user?.id}>`);
        if (prefixMention.test(message.content) && (!message.content.split(prefixMention).filter(s => s).length || message.content.split(prefixMention).filter(s => s)[0]?.trim() === 'help')) return this.client.commandManager.getHelp(message);

        const parsed = this.parseMessage(message);
        if (!parsed.command) return;

        const cmd = this.client.commandManager.find(c => c.name === parsed.command);
        if (parsed.other.length === 1 && parsed.other[0] === 'help') return cmd?.wantHelp(message);
        if (!parsed.other.length && message.reference) {
            const referenced = message.referencedMessage ?? message.channel.messages.resolve(message.reference.messageID ?? '');
            if (!referenced) return;
            const parsedTwo = this.parseMessage(referenced);
            if (cmd) this.call(cmd, message, parsedTwo.other);
        } else if (cmd) {
            this.call(cmd, message, parsed.other);
        }
    }

    private call(cmd: Command, message: Message, arg: string[]) {
        try {
            cmd.execute(message, arg);
        } catch (e) {
            this.logger.error(e);
            const embed = new MessageEmbed().setColor('RED');
            if (cmd.madeBy === message.author.id) {
                embed.setTitle('An error occured with your command');
            } else {
                embed.setTitle('Unexpected error occured when executing a command');
            }
            embed
                .setDescription(e)
                .addField('Command ID', cmd.id);
            message.reply({ embed: embed, allowedMentions: { repliedUser: false } });
        }
    }

    private parseMessage(message: Message) {
        const commands = this.client.commandManager.filter(c => ['0', message.author.id].includes(c.madeBy) || c.madeIn === message.guild?.id);

        const parseOne = message.content.split(/(?:`{3}(`{3})`{3}|(`{3}))/g).filter(s => s);
        const sortOne: string[] = [];
        for (const p of parseOne) {
            sortOne.push(sortOne[sortOne.length - 1]?.lastIndexOf('```') === 0 ? `${sortOne.pop()}${p}` : p);
        }

        const parseTwo = sortOne.flatMap(p => p.includes('```') ? p : p.split(/(?=[\n ])|(?<=[\n ])/g));

        const cmd = parseTwo.find(p => commands.map(c => c.name).indexOf(p) >= 0);
        const filtered = parseTwo.filter(p => p !== cmd);

        const sortTwo: string[] = [];
        for (const p of filtered) {
            sortTwo.push(p.includes('```') || sortTwo[sortTwo.length - 1]?.includes('```') || !sortTwo.length ? p : `${sortTwo.pop()}${p}`);
        }

        return { command: cmd, other: sortTwo.map(s => s.trim()) };
    }
}
