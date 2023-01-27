import type { MessageContextMenuCommandInteraction } from 'discord.js';
import { ApplicationCommandType } from 'discord.js';
import type { DevToolBot } from '../DevToolBot';
import {
  BrainfuckEvaluationSystem,
  CSharpEvaluationSystem,
  DenoEvaluationSystem,
  JavaEvaluationSystem,
  JavaScriptEvaluationSystem,
  KotlinEvaluationSystem,
  PythonEvaluationSystem,
  TypeScriptEvaluationSystem,
} from '../evaluation';
import { parseContent } from '../helper';
import { Command } from '../interface';

const codeBlockRegex = /^`{3}(?<lang>[a-z]+)\n(?<code>[\s\S]+)\n`{3}$/mu;

export default class extends Command {
  public constructor(client: DevToolBot) {
    super(client, {
      type: ApplicationCommandType.Message,
      name: '実行',
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
      return interaction.editReply(
        [
          '対象のメッセージに、コードブロックを使用されている部分を見つけることはできませんでした',
          '> 例)',
          '> \\`\\`\\`js',
          "> console.log('Hello World')",
          '> ```',
        ].join('\n')
      );
    }

    for await (const content of parseContent(message.content)) {
      if (!codeBlockRegex.test(content)) return;

      const codeblock = codeBlockRegex.exec(content)?.groups ?? {};
      switch (codeblock['lang']?.toLowerCase()) {
        case 'js':
        case 'javascript':
          await message.reply(
            await new JavaScriptEvaluationSystem().evaluate(
              codeblock['code'] ?? ''
            )
          );
          break;

        case 'ts':
        case 'typescript':
          await message.reply(
            await new TypeScriptEvaluationSystem().evaluate(
              codeblock['code'] ?? ''
            )
          );
          break;

        case 'deno':
          await message.reply(
            await new DenoEvaluationSystem().evaluate(codeblock['code'] ?? '')
          );
          break;

        case 'py':
        case 'python':
          await message.reply(
            await new PythonEvaluationSystem().evaluate(codeblock['code'] ?? '')
          );
          break;

        case 'java':
          await message.reply(
            await new JavaEvaluationSystem().evaluate(codeblock['code'] ?? '')
          );
          break;

        case 'kt':
        case 'kotlin':
          await message.reply(
            await new KotlinEvaluationSystem().evaluate(codeblock['code'] ?? '')
          );
          break;

        case 'cs':
        case 'csharp':
          await message.reply(
            await new CSharpEvaluationSystem().evaluate(codeblock['code'] ?? '')
          );
          break;

        case 'brainfuck':
          await message.reply(
            await new BrainfuckEvaluationSystem().evaluate(
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
              }\` が実行できるようにあなたの手で対応しませんか？`,
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
