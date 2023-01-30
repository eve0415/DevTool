import type { BaseMessageOptions, ColorResolvable } from 'discord.js';
import type { Language } from 'src/interface';
import { Colors } from 'discord.js';
import { createMessageFromText } from '../util';

export abstract class BaseBuildingSystem {
  protected embedColor: ColorResolvable = Colors.Blurple;
  private readonly resultLanguage: Language | '' = '';

  constructor(options: { resultLanguage: Language }) {
    this.resultLanguage = options.resultLanguage;
  }

  public build(content: string): Promise<BaseMessageOptions> {
    return this.buildSnippet(content)
      .then(result => {
        return this.createMessage(result);
      })
      .catch(er => {
        return this.createErrorMessage(
          er instanceof Error ? er : new Error('エラーが発生しました')
        );
      });
  }

  protected abstract buildSnippet(content: string): Promise<string>;

  protected createMessage(result: string): BaseMessageOptions {
    if (!result) result = '返り値がありません';
    return createMessageFromText(result, {
      title: 'ビルド結果',
      embedColor: this.embedColor,
      lang: this.resultLanguage,
    });
  }

  protected createErrorMessage(error: Error): BaseMessageOptions {
    return {
      embeds: [
        {
          color: Colors.DarkRed,
          title: error.name,
          description: `${error.message}\n${error.stack ?? ''}`,
        },
      ],
    };
  }
}
