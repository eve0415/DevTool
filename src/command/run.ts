import { ContextMenuInteraction } from 'discord.js';
import { DevToolBot } from '../DevToolBot';
import { JavaScriptEvaluationSystem, PythonEvaluationSystem, TypeScriptEvaluationSystem } from '../evaluation';
import { Command } from '../interface';

const codeBlockRegex = /^`{3}(?<lang>[a-z]+)\n(?<code>[\s\S]+)\n`{3}$/mu;

export default class extends Command {
    public constructor(protected readonly client: DevToolBot) {
        super(client, {
            type: 'MESSAGE',
            name: '実行',
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
                    await message.reply(await new JavaScriptEvaluationSystem().evaluate(codeblock.code));
                    break;

                case 'ts':
                case 'typescript':
                    await message.reply(await new TypeScriptEvaluationSystem().evaluate(codeblock.code));
                    break;

                case 'py':
                case 'python':
                    await message.reply(await new PythonEvaluationSystem().evaluate(codeblock.code));
                    break;

                default:
                    await message.reply([
                        `現在この言語はまだ未対応です: \`${codeblock.lang}\``,
                        '一緒に開発してくれる方を募集しています',
                        `\`${codeblock.lang}\` が対応できるようにしませんか？`,
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
