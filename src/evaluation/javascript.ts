import { ChildProcessWithoutNullStreams, spawn } from 'child_process';
import { DMChannel, Message, TextChannel } from 'discord.js';
import { BaseEvaluation } from '../interfaces';

export class JSEvaluationManager extends BaseEvaluation<ChildProcessWithoutNullStreams> {
    public startEvaluate(channel: TextChannel | DMChannel): void {
        const process = this.startProcess();
        process.on('close', code => {
            channel.send(this.createmessage(`Process exited with code ${code}`, 'js'));
            this.delete(channel.id);
        });
        this.set(channel.id, process);
    }

    public evaluateCode(message: Message, content: string): void {
        const process = this.get(message.channel.id);
        process?.stdout.once('data', data => {
            const res = this.processContent(data);
            if (res) message.reply(this.createmessage(res, 'js'));
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
            const res = this.processContent(data);
            if (res) {
                hasError = true;
                result.push(res);
            }
        });
        process.on('error', err => message.extendedReply(this.createErrorMessage(err)));
        process.on('close', () => message.extendedReply(this.createmessage(result.join('\n'), 'js', hasError)));
        process.stdin.write(`${content}\n.exit\n`);
        setTimeout(() => {
            if (!process.connected) return;
            hasError = true;
            result.push('10 seconds timeout exceeded');
            process.kill('SIGKILL');
        }, 10000);
    }

    protected startProcess(): ChildProcessWithoutNullStreams {
        const process = spawn('node',
            ['-i',
                '--experimental-vm-modules',
                '--experimental-repl-await',
                '--experimental-import-meta-resolve',
                '--experimental-json-modules',
                '--disallow-code-generation-from-strings'],
            { env: { DISCORD_TOKEN: '' } },
        );
        process.stdout.setEncoding('utf8');
        process.stderr.setEncoding('utf8');
        return process;
    }

    protected processContent(content: unknown): string | undefined {
        const result = super.processContent(content);
        if (/^\.{2,}$/.test(result ?? '')) return;
        return result;
    }
}
