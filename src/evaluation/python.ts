import { ChildProcessWithoutNullStreams, spawn } from 'child_process';
import { DMChannel, Message, TextChannel } from 'discord.js';
import { BaseEvaluation } from '../interfaces';

export class PythonEvaluationManager extends BaseEvaluation<ChildProcessWithoutNullStreams> {
    public startEvaluate(channel: TextChannel | DMChannel): void {
        const process = this.startProcess();
        process.on('close', () => {
            channel.send(this.createmessage(`Process exited with code ${process.exitCode}`, 'js'));
            this.delete(channel.id);
        });
        this.set(channel.id, process);
    }

    public evaluateCode(message: Message, content: string): void {
        const process = this.get(message.channel.id);
        process?.stdout.once('data', data => {
            const res = this.processContent(data);
            if (res) message.reply(this.createmessage(res, 'py'));
        });
        process?.stdin.write(`${content}\n`);
    }

    public killEvaluate(channel: TextChannel | DMChannel): void {
        const process = this.get(channel.id);
        if (!process?.connected) return;
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
            hasError = true;
            const res = this.processContent(data);
            if (res) result.push(res);
        });
        process.on('error', err => message.reply(this.createErrorMessage(err)));
        process.on('close', () => message.reply(this.createmessage(result.join('\n'), 'py', hasError)));
        process.stdin.write(`${content}\nexit()\n`);
        setTimeout(() => {
            if (!process.connected) return;
            hasError = true;
            result.push('10 seconds timeout exceeded');
            process.kill('SIGKILL');
        }, 10000);
    }

    protected startProcess(): ChildProcessWithoutNullStreams {
        const p = spawn(process.platform !== 'win32' ? 'python3' : 'python', ['-i', '-I'], { shell: true, env: { DISCORD_TOKEN: '' } });
        p.stdout.setEncoding('utf8');
        p.stderr.setEncoding('utf8');
        return p;
    }
}
