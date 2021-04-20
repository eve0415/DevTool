import { Message } from 'discord.js';
import { ScriptTarget, transpile } from 'typescript';
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
            runJS(message, arg);
        } else {
            const codeblock = codeBlockRegex.exec(arg)?.groups ?? {};
            switch (codeblock.lang.toLowerCase()) {
                case 'js':
                case 'javascript':
                case 'ts':
                case 'typescript':
                    runJS(message, codeblock.code);
                    break;

                default:
                    break;
            }
        }
    }
}

function runJS(message: Message, code: string) {
    const transpiled = transpile(code, { allowJs: true, importHelpers: false, target: ScriptTarget.ES2020 });
    try {
        const vm = new VM({ timeout: 10000 });
        vm.run(transpiled);
    } catch (e) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-call
        if (e.code === 'ERR_SCRIPT_EXECUTION_TIMEOUT') return message.reply({ embed: { description: 'Timeout error occured', color: 'RED' }, allowedMentions: { repliedUser: false } });
    }
    instance.evalManager.evaluateOnce(message, transpiled);
}
