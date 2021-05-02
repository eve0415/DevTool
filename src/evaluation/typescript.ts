import { ChildProcessWithoutNullStreams, spawn } from 'child_process';
import { DMChannel, Message, TextChannel } from 'discord.js';
import { BaseEvaluation } from '../interfaces';

export class TSEvaluationManager extends BaseEvaluation<ChildProcessWithoutNullStreams> {
    public startEvaluate(channel: TextChannel | DMChannel): void {
        const process = this.startProcess();
        process.on('close', code => {
            channel.send(this.createmessage(`Process exited with code ${code}`, 'ts', code));
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
        if (process?.exitCode) return;
        process?.kill('SIGKILL');
    }

    public evaluateOnce(message: Message, content: string): void {
        const process = this.startProcess();
        const result: string[] = [];
        process.stdout.on('data', data => {
            const res = this.processContent(data);
            if (res) result.push(res);
        });
        process.on('stderr', err => result.push(err));
        process.on('error', err => message.reply(this.createErrorMessage(err)));
        process.on('close', code => message.reply(this.createmessage(result.join('\n'), 'ts', code)));
        process.stdin.write(`${content}\n.exit\n`);
        setTimeout(() => {
            if (process.exitCode) return;
            result.push('10 seconds timeout exceeded');
            process.kill('SIGKILL');
        }, 10000);
    }

    protected startProcess(): ChildProcessWithoutNullStreams {
        const p = spawn('ts-node', ['-i'], { shell: true, env: { DISCORD_TOKEN: '' } });
        p.stdout.setEncoding('utf8');
        p.stderr.setEncoding('utf8');
        return p;
    }

    protected processContent(content: unknown): string | undefined {
        const result = super.processContent(content);
        if (/^\.{2,}$/.test(result ?? '')) return;
        return result;
    }
}