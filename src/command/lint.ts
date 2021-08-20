import { ContextMenuInteraction } from 'discord.js';
import { DevToolBot } from '../DevToolBot';
import { Command } from '../interface';
import { CodeLintManager } from '../manager';

const codeBlockRegex = /^`{3}(?<lang>[a-z]+)\n(?<code>[\s\S]+)\n`{3}$/mu;

export default class extends Command {
    public constructor(protected readonly client: DevToolBot) {
        super(client, {
            type: 'MESSAGE',
            name: '整形',
        });
    }

    public async run(interaction: ContextMenuInteraction): Promise<unknown> {
        await interaction.deferReply({ ephemeral: true });

        const message = await interaction.channel?.messages.fetch(interaction.targetId);
        if (!message) {
            return interaction.editReply('対象のメッセージの取得に失敗しました');
        }
        if (!codeBlockRegex.test(message.content)) {
            return interaction.editReply([
                '対象のメッセージに、コードブロックを使用されている部分を見つけることはできませんでした',
                '> 例)',
                '> \\`\\`\\`js',
                '> console.log(\'Hello World\')',
                '> ```',
            ].join('\n'));
        }


        for (const content of this.parseContent(message.content)) {
            if (!codeBlockRegex.test(content)) return;

            const codeblock = codeBlockRegex.exec(content)?.groups ?? {};
            switch (codeblock.lang.toLowerCase()) {
                case 'js':
                case 'javascript':
                    await message.reply(CodeLintManager.lintJavaScript(codeblock.code));
                    break;

                case 'ts':
                case 'typescript':
                    await message.reply(CodeLintManager.lintTypeScript(codeblock.code));
                    break;

                case 'css':
                    await message.reply(CodeLintManager.lintCss(codeblock.code));
                    break;

                case 'md':
                case 'markdown':
                    await message.reply(CodeLintManager.lintMd(codeblock.code));
                    break;

                case 'json':
                    await message.reply(CodeLintManager.lintJson(codeblock.code));
                    break;

                case 'yml':
                case 'yaml':
                    await message.reply(CodeLintManager.lintYaml(codeblock.code));
                    break;

                case 'html':
                    await message.reply(CodeLintManager.lintHtml(codeblock.code));
                    break;

                default:
                    await message.reply([
                        `現在この言語はまだ未対応です: \`${codeblock.lang}\``,
                        '一緒に開発してくれる方を募集しています',
                        `\`${codeblock.lang}\` が整形できるようにあなたの手で対応しませんか？`,
                    ].join('\n'));
                    break;
            }
        }

        await interaction.editReply('実行完了しました');
    }

    private parseContent(content: string) {
        const parse = content.split(/(?:`{3}(`{3})`{3}|(`{3}))/g).filter(s => s);
        const sort: string[] = [];
        for (const p of parse) {
            sort.push(sort[sort.length - 1]?.lastIndexOf('```') === 0 ? `${sort.pop()}${p}` : p);
        }
        const purge = sort.filter(s => s.startsWith('```'));
        return purge;
    }
}
