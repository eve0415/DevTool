import type { ContextMenuInteraction } from 'discord.js';
import type { DevToolBot } from '../DevToolBot';
import { Command } from '../interface';
import { run } from '../temporary';

const codeBlockRegex = /^`{3}(?<lang>[a-z]+)\n(?<code>[\s\S]+)\n`{3}$/mu;

export default class extends Command {
    public constructor(protected override readonly client: DevToolBot) {
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

        await run(message);

        await interaction.editReply('実行完了しました');
    }
}
