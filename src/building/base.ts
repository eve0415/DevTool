import type { BaseMessageOptions, ColorResolvable} from 'discord.js';
import { Colors } from 'discord.js';
import { createMessageFromText } from "../util";

export abstract class BaseBuildingSystem {
  protected embedColor: ColorResolvable = Colors.Blurple;

  public build(
    content: string,
  ): Promise<BaseMessageOptions>{
    return this.buildSnipet(content)
      .then(result => {
        return this.createMessage(result);
      })
      .catch(er => {
        return this.createErrorMessage(er instanceof Error ? er : new Error("エラーが発生しました"));
      });
  }

  protected abstract buildSnipet(content:string):Promise<string>;

  protected createMessage(result: string): BaseMessageOptions {
    if (!result) result = '返り値がありません';
    return createMessageFromText(result, {
      title: "ビルド結果",
      embedColor: this.embedColor,
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
