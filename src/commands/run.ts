import { Message } from 'discord.js';
import { transpile } from 'typescript';
import { VM } from 'vm2';
import { instance } from '..';
import { SystemCommandBuilder } from '../api';

new SystemCommandBuilder()
    .setName('run')
    .setDescription('Run a script that you sent!')
    .setFunction(run)
    .buildAndRegister();

const codeBlockRegex = /^`{3}(?<lang>[a-z]+)\n(?<code>[\s\S]+)\n`{3}$/mu;

function run(message: Message, args: string[]) {
    for (const arg of args) {
        if (!codeBlockRegex.test(arg)) {
            runJS(message, transpile(arg));
        } else {
            const codeblock = codeBlockRegex.exec(arg)?.groups ?? {};
            switch (codeblock.lang.toLowerCase()) {
                case 'js':
                case 'javascript':
                case 'ts':
                case 'typescript':
                    runJS(message, transpile(codeblock.code));
                    break;

                default:
                    break;
            }
        }
    }
}

const vm = new VM({
    timeout: 10000,
});

function runJS(message: Message, code: string) {
    try {
        vm.run(transpile(code));
    } catch (e) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-call
        if (e.code === 'ERR_SCRIPT_EXECUTION_TIMEOUT') return message.reply({ embed: { description: 'Timeout error occured', color: 'RED' }, allowedMentions: { repliedUser: false } });
    }
    instance.evalManager.evaluateOnce(message, transpile(code));
}
