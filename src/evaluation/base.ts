import type { Language } from '../interface';
import type { ColorResolvable, ReplyMessageOptions } from 'discord.js';
import { inspect } from 'util';
import { MessageAttachment, MessageEmbed } from 'discord.js';
import treeKill from 'tree-kill';

export abstract class BaseEvaluationSystem {
    protected embedColor: ColorResolvable = 'BLURPLE';
    protected result: unknown[] = [];

    public abstract evaluate(content: string): Promise<ReplyMessageOptions>;

    protected kill(pid: number): void {
        setTimeout(() => {
            treeKill(pid, 'SIGKILL');
            this.embedColor = 'DARK_RED';
            this.result.push('10秒を超過して実行することはできません');
        }, 10000);
    }

    protected processContent(content: unknown[]): string[] {
        const str = content
            .map(c => typeof c !== 'string'
                ? inspect(c, { depth: null, maxArrayLength: null })
                : c);

        str.shift();

        return str
            .flatMap(s => s.split('\\n'))
            .map(s => s.trimEnd())
            .map(c => c
                .replaceAll('undefined\n>', '')
                .replaceAll('jshell>', '')
                .replaceAll('>', ''),
            );
    }

    protected createMessage(contents: unknown[], lang: Language): ReplyMessageOptions {
        let result = this.processContent(contents).filter(c => c).join('\n');
        if (!result) result = '返り値がありません';

        if (result.length <= 4080) {
            const embed = new MessageEmbed()
                .setColor(this.embedColor)
                .setDescription(`\`\`\`${lang}\n${result}\n\`\`\``);
            return { embeds: [embed] };
        }

        const content = `実行結果です。ファイルをご覧ください。${Buffer.from(result).byteLength / 1024 / 1024 > 8 ? '\nファイルの容量が8MBを超えたため、一部の結果が省略されています' : ''}`;

        while (Buffer.from(result).byteLength / 1024 / 1024 > 8) {
            const cache = result.split('\n');

            result = (cache.length === 1
                ? cache[0]?.substring(cache[0].length - Number(cache[0].length.toString().slice(0, -1)))
                : cache.splice(0, cache.length - Number(cache.length.toString().slice(0, -1))).join('\n')) ??
            '';
        }

        return {
            content: content,
            files: [new MessageAttachment(Buffer.from(result), 'result.txt')],
        };
    }

    protected createErrorMessage(error: Error): ReplyMessageOptions {
        return {
            embeds: [{
                color: 'DARK_RED',
                title: error.name,
                description: `${error.message}\n${error.stack}`,
            }],
        };
    }
}
