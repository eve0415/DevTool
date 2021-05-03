import { inspect } from 'util';
import {
    Collection,
    DMChannel,
    Message,
    MessageAttachment,
    MessageEmbed,
    MessageOptions,
    Snowflake,
    TextChannel,
} from 'discord.js';
import { PLanguage } from '.';

export abstract class BaseEvaluation<T> extends Collection<Snowflake, T> {
    public abstract startEvaluate(channel: TextChannel | DMChannel): void;

    public abstract evaluateCode(message: Message, content: string): void;

    public abstract killEvaluate(channel: TextChannel | DMChannel): void;

    public abstract evaluateOnce(message: Message, content: string): void;

    protected abstract startProcess(): unknown;

    protected processContent(content: unknown): string | undefined {
        const string = (typeof content !== 'string' ? inspect(content, { depth: null, maxArrayLength: null }) : content).trim();
        if (string.includes('for more information.')) return;
        return string.replaceAll('undefined\n>', '').replaceAll('>', '').trim();
    }

    protected createmessage(result: string, lang: PLanguage, hasError = false): MessageOptions {
        if (!result) result = 'No returned value';
        if (result.length <= 1990) {
            const embed = new MessageEmbed()
                .setColor(!hasError ? 'BLUE' : 'RED')
                .setDescription(`\`\`\`${lang}\n${result}\n\`\`\``);
            return { embed: embed, allowedMentions: { repliedUser: false } };
        }
        let overSize = false;
        while (Buffer.from(result).byteLength / 1024 / 1024 > 8) {
            overSize = true;
            const cache = result.split('\n');
            cache.splice(0, cache.length - Number(cache.length.toString().slice(0, -1)));
            result = cache.join('\n');
        }
        return {
            content: `The result of evaluation. See attached.${overSize ? '\nThe result was omitted as the size was over 8 GB' : ''}`,
            files: [new MessageAttachment(Buffer.from(result), 'result.txt')],
            allowedMentions: { repliedUser: false },
        };
    }

    protected createErrorMessage(error: Error): MessageOptions {
        return {
            embed: new MessageEmbed()
                .setColor('RED')
                .setTitle(error.name)
                .setDescription(`${error.message}\n${error.stack}`),
            allowedMentions: { repliedUser: false },
        };
    }
}
