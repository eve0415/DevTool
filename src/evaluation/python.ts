import { join } from 'path';
import { DMChannel, Message, TextChannel } from 'discord.js';
import { PythonShell } from 'python-shell';
import { BaseEvaluation } from '../interfaces';

export class PythonEvaluationManager extends BaseEvaluation<PythonShell> {
    public startEvaluate(channel: TextChannel | DMChannel): void {
        const process = this.startProcess();
        process.on('close', () => {
            channel.send(this.createmessage(`Process exited with code ${process.exitCode}`, 'js', process.exitCode));
            this.delete(channel.id);
        });
        this.set(channel.id, process);
    }

    public evaluateCode(message: Message, content: string): void {
        const process = this.get(message.channel.id);
        process?.stdout.once('data', data => {
            const res = this.processContent(data);
            if (res) message.reply(this.createmessage(res, 'py', process.exitCode));
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
        process.on('close', () => message.reply(this.createmessage(result.join('\n'), 'py', process.exitCode)));
        process.stdin.write(`${content}\n`);
        setTimeout(() => {
            if (process.exitCode) return;
            result.push('10 seconds timeout exceeded');
            process.kill('SIGKILL');
        }, 11000);
    }

    protected startProcess(): PythonShell {
        const process = new PythonShell(join(__dirname, '../scripts/exec.py'), { mode: 'text', env: { DISCORD_TOKEN: '' } });
        process.stdout.setEncoding('utf8');
        process.stderr.setEncoding('utf8');
        return process;
    }
}
