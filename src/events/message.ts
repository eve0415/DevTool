import { Message } from 'discord.js';
import { DevToolBot } from '..';
import { Event } from '../interfaces';

export default class extends Event {
    public constructor(client: DevToolBot) {
        super(client, 'message');
    }

    public run(message: Message): unknown {
        if (message.system || message.author.bot) return;

        const prefixMention = new RegExp(`<@?!${this.client.user?.id}>`);
        console.log(message.content.split(prefixMention));
        if (prefixMention.test(message.content) && (!message.content.split(prefixMention).filter(s => s).length || message.content.split(prefixMention).filter(s => s)[0]?.trim() === 'help')) return this.client.commandManager.getHelp(message);

        const parsed = this.parseMessage(message);
        if (!parsed.command) return;
        this.logger.debug(parsed);
        const cmd = this.client.commandManager.find(c => c.name === parsed.command);
        if (parsed.other === 'help') return cmd?.wantHelp(message);
        if (!parsed.codeBlock && !parsed.other && message.reference) {
            const referenced = message.referencedMessage ?? message.channel.messages.resolve(message.reference.messageID ?? '');
            if (!referenced) return;
            const parsedTwo = this.parseMessage(referenced);
            this.logger.debug(parsedTwo);
            cmd?.execute(message, [parsedTwo.other].concat(parsedTwo.codeBlock ?? '').filter(a => a));
        } else {
            cmd?.execute(message, [parsed.other].concat(parsed.codeBlock ?? '').filter(a => a));
        }
    }

    private parseMessage(message: Message) {
        const commands = this.client.commandManager.filter(c => ['0', message.author.id].includes(c.madeBy) || c.madeIn === message.guild?.id);
        if (message.content.includes('```')) {
            const parsed = message.content.split(/(^`{3}.+`{3}$)|(\n)/gims).filter(e => e !== '\n' && e);
            const eachCodeBlock = parsed.filter(p => p.includes('```')).flatMap(i => i.split('```').filter(e => e !== '\n' && e)).map(s => `\`\`\`${s}\`\`\``);
            const cmd = parsed.filter(p => !p.includes('```')).find(p => commands.map(c => c.name).indexOf(p) >= 0);
            return { command: cmd, codeBlock: eachCodeBlock, other: parsed.filter(p => !p.includes('```') && p !== cmd).join('\n') };
        } else {
            const parsed = message.content.split(/(?=[\n ])|(?<=[\n ])/g);
            this.logger.debug(parsed);
            const cmd = parsed.find(p => commands.map(c => c.name).indexOf(p) >= 0);
            return { command: cmd, codeBlock: null, other: parsed.filter(p => p !== cmd).join('').trim() };
        }
    }
}
