import { ChildProcessWithoutNullStreams, spawn } from 'child_process';
import { SIGKILL } from 'constants';
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
import { instance } from '..';
import { PLanguage, processData } from '../interfaces';

export class EvaluationManager extends Collection<Snowflake, { lang: PLanguage, process: ChildProcessWithoutNullStreams }> {
    public startEvaluate(channel: TextChannel | DMChannel, lang: PLanguage): void {
        const process = this.startProcess(lang);
        process.on('close', code => {
            channel.send(this.createmessage(`Process exited with code ${code}`, lang, code));
            this.delete(channel.id);
        });
        this.set(channel.id, { lang: lang, process: process });
    }

    public evaluateCode(message: Message, content: string): void {
        const cache = this.get(message.channel.id);
        cache?.process.stdout.once('data', data => {
            const res = this.processContent(data);
            if (res) message.reply(this.createmessage(res, cache?.lang));
        });
        cache?.process.stdin.write(`${this.processString(content)}\n`);
    }

    public killEvaluate(channel: TextChannel | DMChannel): void {
        const cache = this.get(channel.id);
        if (cache?.process.exitCode) return;
        cache?.process.kill(SIGKILL);
    }

    public evaluateOnce(message: Message, content: string, lang: PLanguage): void {
        const process = this.startProcess(lang);
        const result: string[] = [];
        process.stdout.on('data', data => {
            const res = this.processContent(data);
            if (res) result.push(res);
        });
        process.on('close', code => message.reply(this.createmessage(result.join('\n'), lang, code)));
        process.stdin.write(`${this.processString(content)}\n${processData.find(p => p.lang === lang)?.exit}\n`);
        setTimeout(() => {
            result.push('10 seconds timeout exceeded');
            process.kill(SIGKILL);
        }, 10000);
    }

    private startProcess(lang: PLanguage) {
        let process: ChildProcessWithoutNullStreams;
        switch (lang) {
            case 'js':
                process = spawn('node', ['-i']);
                break;

            case 'py':
                process = spawn('python', ['-i']);
                break;
        }
        process.stdout.setEncoding('utf8');
        return process;
    }

    private processString(string: string) {
        const token = 'DONtTRyTOSteALThETokEn0k.PLeasE.YOuHaVEBeENWARnedD0N0TuSEIT';
        return string
            .replaceAll(instance.token ?? '', token)
            .replaceAll('instance.token', `'${token}'`)
            .replaceAll('client.token', `'${token}'`)
            .replaceAll('process.env.DISCORD_TOKEN', `'${token}'`);
    }

    private processContent(content: unknown) {
        const string = this.processString(typeof content !== 'string' ? inspect(content, { depth: null, maxArrayLength: null }) : content).trim();
        if (string.includes('for more information.')) return;
        if (processData.flatMap(p => p.ignore).includes(string)) return;
        return string.replaceAll('undefined\n>', '').replaceAll('>', '').replaceAll('undefined', '').trim();
    }

    private createmessage(result: string, lang: PLanguage, code?: number | null): MessageOptions {
        if (!result) result = 'No returned value';
        if (!code) code = 0;
        if (result.length <= 1990) {
            const embed = new MessageEmbed()
                .setColor(code === 0 ? 'BLUE' : 'RED')
                .setDescription(`\`\`\`${lang}\n${result}\n\`\`\``);
            return { embed: embed, allowedMentions: { repliedUser: false } };
        }
        const overSize = Buffer.from(result).byteLength / 1024 / 1024 > 8;
        while (Buffer.from(result).byteLength / 1024 / 1024 > 8) {
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
}
