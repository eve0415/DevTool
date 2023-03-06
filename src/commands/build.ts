import type { MessageContextMenuCommandInteraction } from 'discord.js';
import { ApplicationCommandType, ChannelType } from 'discord.js';

import {
  CoffeeScriptBuildingSystem,
  SassBuildingSystem,
  TypeScriptBuildingSystem,
} from '../building';
import type { DevToolBot } from '../DevToolBot';
import { parseContent } from '../helper';
import { Command } from '../interface';

const codeBlockRegex = /^`{3}(?<lang>[a-z]+)\n(?<code>[\s\S]+)\n`{3}$/mu;

export default class extends Command {
  public constructor(client: DevToolBot) {
    super(client, {
      type: ApplicationCommandType.Message,
      name: 'ビルド',
    });
  }

  public async run(
    interaction: MessageContextMenuCommandInteraction
  ): Promise<unknown> {
    await interaction.deferReply({ ephemeral: true });

    // Workaround
    const message =
      interaction.channel?.type !== ChannelType.GuildStageVoice
        ? await interaction.channel?.messages.fetch(interaction.targetId)
        : null;
    if (!message) {
      return interaction.editReply('対象のメッセージの取得に失敗しました');
    }
    if (!codeBlockRegex.test(message.content)) {
      return interaction.editReply(this.noCodeBlock);
    }

    for await (const content of parseContent(message.content)) {
      if (!codeBlockRegex.test(content)) return;

      const codeblock = codeBlockRegex.exec(content)?.groups ?? {};
      switch (codeblock['lang']?.toLowerCase()) {
        case 'deno':
        case 'py':
        case 'python':
        case 'java':
        case 'kt':
        case 'kotlin':
        case 'cs':
        case 'csharp':
        case 'brainfuck':
        case 'js':
          await message.reply('この言語をビルドすることはできません');
          break;

        case 'ts':
        case 'tsx':
          await message.reply(
            await new TypeScriptBuildingSystem().build(codeblock['code'] ?? '')
          );
          break;

        case 'sass':
        case 'scss':
          await message.reply(
            await new SassBuildingSystem().build(codeblock['code'] ?? '')
          );
          break;

        case 'coffeescript':
        case 'coffee':
          await message.reply(
            await new CoffeeScriptBuildingSystem().build(
              codeblock['code'] ?? ''
            )
          );
          break;

        default:
          await message.reply(
            [
              `現在この言語はまだ未対応です: \`${codeblock['lang'] ?? ''}\``,
              '一緒に開発してくれる方を募集しています',
              `\`${
                codeblock['lang'] ?? ''
              }\` がビルドできるようにあなたの手で対応しませんか？`,
            ].join('\n')
          );
          break;
      }
    }

    await interaction.editReply('実行完了しました');
  }

  public autoCompletion(): Promise<never> {
    return Promise.reject(
      new Error('This command does not support auto completion')
    );
  }
}
