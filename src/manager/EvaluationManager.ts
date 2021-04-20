import { ChildProcessWithoutNullStreams, spawn } from 'child_process';
import { inspect } from 'util';
import { Collection, DMChannel, Message, MessageAttachment, MessageEmbed, MessageOptions, Snowflake, TextChannel } from 'discord.js';
import { instance } from '..';

export class EvaluationManager extends Collection<Snowflake, ChildProcessWithoutNullStreams> {
    public startEvaluate(channel: TextChannel | DMChannel): void {
        const process = this.startProcess();
        process.on('close', code => {
            channel.send(this.createmessage(`Process exited with code ${code}`, code ?? 0));
            this.delete(channel.id);
        });
        this.set(channel.id, process);
    }

    public evaluateCode(message: Message, content: string): void {
        const process = this.get(message.channel.id);
        process?.stdout.once('data', data => {
            const res = this.processContent(data);
            if (res) message.reply(this.createmessage(res));
        });
        process?.stdin.write(`${this.processString(content)}\n`);
    }

    public killEvaluate(channel: TextChannel | DMChannel): void {
        const process = this.get(channel.id);
        process?.stdin.write('.exit\n');
        process?.kill();
    }

    public evaluateOnce(message: Message, content: string): void {
        const process = this.startProcess();
        const result: string[] = [];
        process.stdout.on('data', data => {
            const res = this.processContent(data);
            if (res) result.push(res);
        });
        process.on('close', () => message.reply(this.createmessage(result.join('\n'))));
        process.stdin.write(`${this.processString(content)}\n.exit\n`);
    }

    private startProcess() {
        const process = spawn('node', ['-i']);
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
        if (string.startsWith('Welcome to Node.js ')) return;
        if (string === '...') return;
        return string.replaceAll('undefined\n>', '').replaceAll('>', '').replaceAll('undefined', '').trim();
    }

    private createmessage(result: string, code = 0): MessageOptions {
        if (!result) result = 'No returned value';
        if (result.length <= 1990) {
            const embed = new MessageEmbed()
                .setColor(code === 0 ? 'BLUE' : 'RED')
                .setDescription(`\`\`\`js\n${result}\n\`\`\``);
            return { embed: embed, allowedMentions: { repliedUser: false } };
        }
        return {
            content: 'The result of evaluation. See attached',
            files: [new MessageAttachment(Buffer.from(result), 'result.txt')],
            allowedMentions: { repliedUser: false },
        };
    }
}
