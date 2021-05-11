import { ChildProcessWithoutNullStreams, spawn } from 'child_process';
import { DMChannel, Message, TextChannel } from 'discord.js';
import { BaseEvaluation } from '../interfaces';

export class TSEvaluationManager extends BaseEvaluation<ChildProcessWithoutNullStreams> {
    public startEvaluate(channel: TextChannel | DMChannel): void {
        const process = this.startProcess();
        process.on('close', code => {
            channel.send(this.createmessage(`Process exited with code ${code}`, 'ts'));
            this.delete(channel.id);
        });
        this.set(channel.id, process);
    }

    public evaluateCode(message: Message, content: string): void {
        const process = this.get(message.channel.id);
        process?.stdout.once('data', data => {
            const res = this.processContent(data);
            if (res) message.reply(this.createmessage(res, 'ts'));
        });
        process?.stdin.write(`${content}\n`);
    }

    public killEvaluate(channel: TextChannel | DMChannel): void {
        const process = this.get(channel.id);
        if (process?.connected) return;
        process?.kill('SIGKILL');
    }

    public evaluateOnce(message: Message, content: string): void {
        const process = this.startProcess();
        const result: string[] = [];
        let hasError = false;
        process.stdout.on('data', data => {
            const res = this.processContent(data);
            if (res) result.push(res);
        });
        process.stderr.on('data', data => {
            console.log(data);
            const res = this.processContent(data);
            if (res) {
                hasError = true;
                result.push(res);
            }
        });
        process.on('error', err => message.reply(this.createErrorMessage(err)));
        process.on('close', () => message.reply(this.createmessage(result.join('\n'), 'ts', hasError)));
        process.stdin.write(`${content}\n.exit\n`);
        setTimeout(() => {
            if (!process.connected) return;
            console.log('timeout');
            hasError = true;
            result.push('10 seconds timeout exceeded');
            process.kill('SIGKILL');
        }, 10000);
    }

    protected startProcess(): ChildProcessWithoutNullStreams {
        const p = spawn(process.platform !== 'win32' ? './node_modules/.bin/ts-node' : 'ts-node', ['-p', '-i'], { shell: true, env: { DISCORD_TOKEN: '' } });
        p.stdout.setEncoding('utf8');
        p.stderr.setEncoding('utf8');
        return p;
    }

    protected processContent(content: unknown): string | undefined {
        const regex = new RegExp(/[\\u001B\\u009B][[\\]()#;?]*(?:(?:(?:[a-zA-Z\\d]*(?:;[-a-zA-Z\\d\\/#&.:=?%@~_]*)*)?\\u0007)|(?:(?:\\d{1,4}(?:;\\d{0,4})*)?[\\dA-PR-TZcf-ntqry=><~]))/g);
        const result = super.processContent(content)?.replaceAll(regex, '');
        if (/Could not open history file/.test(result ?? '')) return;
        if (/^\.{2,}$/.test(result ?? '')) return;
        return result;
    }
}
