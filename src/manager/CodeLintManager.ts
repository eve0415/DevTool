import type { ReplyMessageOptions } from 'discord.js';
import { MessageAttachment } from 'discord.js';
import { format } from 'prettier';
import type { Language } from '../interface';

export class CodeLintManager {
    public static lintJavaScript(code: string): ReplyMessageOptions {
        return createMessage(format(code, { parser: 'babel' }), 'js');
    }

    public static lintTypeScript(code: string): ReplyMessageOptions {
        return createMessage(format(code, { parser: 'babel-ts' }), 'ts');
    }

    public static lintCss(code: string): ReplyMessageOptions {
        return createMessage(format(code, { parser: 'css' }), 'css');
    }

    public static lintMd(code: string): ReplyMessageOptions {
        return createMessage(format(code, { parser: 'markdown' }), 'md');
    }

    public static lintJson(code: string): ReplyMessageOptions {
        return createMessage(format(code, { parser: 'json' }), 'json');
    }

    public static lintYaml(code: string): ReplyMessageOptions {
        return createMessage(format(code, { parser: 'yaml' }), 'yaml');
    }

    public static lintHtml(code: string): ReplyMessageOptions {
        return createMessage(format(code, { parser: 'html' }), 'html');
    }
}

function createMessage(code: string, lang: Language): ReplyMessageOptions {
    if (code.length <= 4080) {
        return {
            embeds: [{
                title: '整形結果(Prettier 標準設定)',
                description: `\`\`\`${lang}\n${code}\n\`\`\``,
                color: 'BLURPLE',
            }],
        };
    }

    if (Buffer.from(code).byteLength / 1024 / 1024 > 8) {
        return {
            content: '整形結果が 8GB を超えるファイルになってしまいました',
        };
    }

    return {
        content: '整形結果です。ファイルをご覧ください。',
        files: [new MessageAttachment(Buffer.from(code), `result.${lang}`)],
    };
}
