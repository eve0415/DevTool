import { DMChannel, Message, TextChannel } from 'discord.js';
import { PythonShell } from 'python-shell';
import { BaseEvaluation } from '../interfaces';

export class PythonEvaluationManager extends BaseEvaluation<PythonShell> {
    public startEvaluate(channel: TextChannel | DMChannel): void {
        const process = this.startProcess();
        process.on('close', () => {
            channel.send(this.createmessage(`Process exited with`, 'py'));
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
        process?.stdin.write(`${this.processString(content)}\n`);
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
        process.on('close', () => message.reply(this.createmessage(result.join('\n'), 'py')));
        process.stdin.write(`${this.processString(content)}\n`);
        setTimeout(() => {
            if (process.exitCode) return;
            result.push('10 seconds timeout exceeded');
            process.kill('SIGKILL');
        }, 11000);
    }

    protected startProcess(): PythonShell {
        const process = new PythonShell('./src/scripts/exec.py', { mode: 'text', timeout: 10000 });
        process.stdout.setEncoding('utf8');
        return process;
    }
}
