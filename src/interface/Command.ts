import type {
  ApplicationCommandData,
  AutocompleteInteraction,
  Interaction,
} from 'discord.js';
import type { Logger } from 'log4js';
import log4js from 'log4js';
import type { DevToolBot } from '../DevToolBot';

export abstract class Command {
  protected readonly logger: Logger;
  protected readonly noCodeBlock = [
    '対象のメッセージに、コードブロックを使用されている部分を見つけることはできませんでした',
    '> 例)',
    '> \\`\\`\\`js',
    "> console.log('Hello World')",
    '> ```',
  ].join('\n');

  protected constructor(
    protected readonly client: DevToolBot,
    public readonly data: ApplicationCommandData
  ) {
    this.logger = log4js.getLogger(data.name);
  }

  public abstract run(interaction: Interaction): Promise<unknown>;

  public abstract autoCompletion(
    interaction: AutocompleteInteraction
  ): Promise<unknown>;
}
