import type { MessageContextMenuCommandInteraction } from 'discord.js';
import { ApplicationCommandType } from 'discord.js';
import type { DevToolBot } from '../DevToolBot';
import { parseContent } from '../helper';
import { Command } from '../interface';
import { CodeLintManager } from '../manager';

const codeBlockRegex = /^`{3}(?<lang>[a-z]+)\n(?<code>[\s\S]+)\n`{3}$/mu;

export default class extends Command {
  public constructor(client: DevToolBot) {
    super(client, {
      type: ApplicationCommandType.Message,
      name: '整形',
    });
  }

  public async run(
    interaction: MessageContextMenuCommandInteraction
  ): Promise<unknown> {
    await interaction.deferReply({ ephemeral: true });

    const message = await interaction.channel?.messages.fetch(
      interaction.targetId
    );
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
        case 'js':
        case 'jsx':
        case 'javascript':
          await message.reply(
            CodeLintManager.lintJavaScript(codeblock['code'] ?? '')
          );
          break;

        case 'ts':
        case 'tsx':
        case 'typescript':
          await message.reply(
            CodeLintManager.lintTypeScript(codeblock['code'] ?? '')
          );
          break;

        case 'css':
          await message.reply(CodeLintManager.lintCss(codeblock['code'] ?? ''));
          break;

        case 'scss':
          await message.reply(
            CodeLintManager.lintScss(codeblock['code'] ?? '')
          );
          break;

        case 'md':
        case 'markdown':
          await message.reply(CodeLintManager.lintMd(codeblock['code'] ?? ''));
          break;

        case 'json':
          await message.reply(
            CodeLintManager.lintJson(codeblock['code'] ?? '')
          );
          break;

        case 'yml':
        case 'yaml':
          await message.reply(
            CodeLintManager.lintYaml(codeblock['code'] ?? '')
          );
          break;

        case 'html':
          await message.reply(
            CodeLintManager.lintHtml(codeblock['code'] ?? '')
          );
          break;

        default:
          await message.reply(
            [
              `現在この言語はまだ未対応です: \`${codeblock['lang'] ?? ''}\``,
              '一緒に開発してくれる方を募集しています',
              `\`${
                codeblock['lang'] ?? ''
              }\` が整形できるようにあなたの手で対応しませんか？`,
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
