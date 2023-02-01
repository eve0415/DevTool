import type { BaseMessageOptions } from 'discord.js';
import { Colors } from 'discord.js';
import prettier from 'prettier';
import { createMessageFromText } from '../util';
import type { Language } from '../interface';

const { format } = prettier;

// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class CodeLintManager {
  public static lintJavaScript(code: string): BaseMessageOptions {
    return createMessage(format(code, { parser: 'babel' }), 'js');
  }

  public static lintTypeScript(code: string): BaseMessageOptions {
    return createMessage(format(code, { parser: 'babel-ts' }), 'ts');
  }

  public static lintCss(code: string): BaseMessageOptions {
    return createMessage(format(code, { parser: 'css' }), 'css');
  }

  public static lintMd(code: string): BaseMessageOptions {
    return createMessage(format(code, { parser: 'markdown' }), 'md');
  }

  public static lintJson(code: string): BaseMessageOptions {
    return createMessage(format(code, { parser: 'json' }), 'json');
  }

  public static lintYaml(code: string): BaseMessageOptions {
    return createMessage(format(code, { parser: 'yaml' }), 'yaml');
  }

  public static lintHtml(code: string): BaseMessageOptions {
    return createMessage(format(code, { parser: 'html' }), 'html');
  }

  public static lintScss(code: string): BaseMessageOptions {
    return createMessage(format(code, { parser: 'scss' }), 'scss');
  }
}

function createMessage(code: string, lang: Language): BaseMessageOptions {
  return createMessageFromText(code, {
    title: '整形結果(Prettier 標準設定)',
    showTitleOnEmbed: true,
    embedColor: Colors.Blurple,
    lang,
  });
}
