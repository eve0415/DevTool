import { inspect } from 'util';
import axios from 'axios';
import type { DiscordAPIError, Message, MessageEditOptions } from 'discord.js';
import { Util } from 'discord.js';
import type { DevToolBot } from '../DevToolBot';
import { Event } from '../interface';
import { getHelp, lint, run } from '../temporary';

const codeBlockRegex = /^`{3}(?<lang>[a-z]+)\n(?<code>[\s\S]+)\n`{3}$/mu;

export default class extends Event {
    public constructor(protected override readonly client: DevToolBot) {
        super(client, __filename);
    }

    public async run(message: Message): Promise<void> {
        this.logger.trace('Recieved message event');

        if (message.author.bot) return;

        if (new RegExp(`^<@!?${this.client.user?.id}>$`).test(message.content)) {
            await message.reply(getHelp('message'));
            return;
        }

        await this.highlightGitLinks(message);

        if (!(['run', 'lint'].includes(message.content) && message.reference)) return;

        const mes = await message.reply('実行中です。少々お待ちください。');
        const reference = await message.fetchReference();
        if (!reference) {
            await mes.edit('対象のメッセージの取得に失敗しました');
            return;
        }
        if (!codeBlockRegex.test(reference.content)) {
            await mes.edit([
                '対象のメッセージに、コードブロックを使用されている部分を見つけることはできませんでした',
                '> 例)',
                '> \\`\\`\\`js',
                '> console.log(\'Hello World\')',
                '> ```',
            ].join('\n'));
            return;
        }

        try {
            if (message.content === 'run') {
                await run(reference);
            }
            if (message.content === 'lint') {
                await lint(reference);
            }

            await mes.edit('実行完了しました');
        } catch (e) {
            this.logger.error(e);

            const exec = /^\/webhooks\/\d+\/(?<token>.+)\/messages\/@original$/.exec((e as DiscordAPIError).path)?.groups ?? {};
            const m: MessageEditOptions = {
                embeds: [{
                    color: 'RED',
                    title: 'An Error Occured When Sending A Message',
                    description: inspect(e, { depth: 1, maxArrayLength: null })
                        .substring(0, 4096)
                        .replace(exec.token ?? 'ABCDEFGHIJKLMN', '*redacted*'),
                }],
            };

            await mes.edit(m).catch(err => this.logger.error(err));
        }
    }

    private async highlightGitLinks(message: Message): Promise<void> {
        const links = [...message.content.matchAll(/https?:\/\/github\.com\/(?<owner>.+?)\/(?<repo>.+?)\/blob\/(?<branch>.+?)\/(?<path>.+?)#L(?<firstLine>\d+)-?L?(?<lastLine>\d+)?/gu)].map(link => link.groups ?? {});

        for (const link of links) {
            const res = await axios.get<Readonly<{ extension: string, code: string[] }>>(`https://gh-highlighted-line.vercel.app/api/${link.owner}/${link.repo}/${link.branch}/${encodeURIComponent(link.path ?? '')}/${link.firstLine}/${link.lastLine ?? ''}`);
            if (!res.data.code.length) continue;
            Util.splitMessage(`\`\`\`${res.data.extension}\n${res.data.code.join('\n')}\n\`\`\``, { prepend: '```', append: '```' }).forEach(m => message.reply(m));
        }
    }
}
