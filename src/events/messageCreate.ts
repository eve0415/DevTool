import type { DevToolBot } from '../DevToolBot';
import type { Message } from 'discord.js';
import axios from 'axios';
import { Util } from 'discord.js';
import { getHelp } from '../helper';
import { Event } from '../interface';

export default class extends Event {
    public constructor(client: DevToolBot) {
        super(client, 'messageCreate');
    }

    public async run(message: Message): Promise<void> {
        this.logger.trace('Recieved message event');

        if (message.author.bot) return;

        if (new RegExp(`^<@!?${this.client.user?.id}>$`).test(message.content)) {
            await message.reply(getHelp('message'));
            return;
        }

        await this.highlightGitLinks(message);
    }

    private async highlightGitLinks(message: Message): Promise<void> {
        const links = [...message.content.matchAll(/https?:\/\/github\.com\/(?<owner>.+?)\/(?<repo>.+?)\/blob\/(?<branch>.+?)\/(?<path>.+?)#L(?<firstLine>\d+)-?L?(?<lastLine>\d+)?/gu)].map(link => link.groups ?? {});

        for (const link of links) {
            const res = await axios.get<Readonly<{ extension: string, code: string[] }>>(`https://gh-highlighted-line.vercel.app/api/${link['owner']}/${link['repo']}/${link['branch']}/${encodeURIComponent(link['path'] ?? '')}/${link['firstLine']}/${link['lastLine'] ?? ''}`);
            if (!res.data.code.length) continue;
            for (const m of Util.splitMessage(`\`\`\`${res.data.extension}\n${res.data.code.join('\n')}\n\`\`\``, { prepend: `\`\`\`${res.data.extension}\n`, append: '```' })) {
                await message.reply(m);
            }
        }
    }
}
