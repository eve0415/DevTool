import { join } from 'path';
import { Message, MessageEmbed } from 'discord.js';
import { NodeVM, VMScript } from 'vm2';
import { CommandBuilder, SystemCommandBuilder } from '../CommandBuilder';

new SystemCommandBuilder()
    .setName('reg')
    .setDescription('You can create your own command')
    .setFunction(registerCommand)
    .buildAndRegister();

async function registerCommand(message: Message, args: string[]) {
    const embed = new MessageEmbed()
        .setTitle('Please wait...')
        .setDescription('Verifying your input...')
        .setColor('BLUE');
    const mes = await message.reply({ embed: embed, allowedMentions: { repliedUser: false } });

    const input = args.length ? args.join(' ') : await interactive(message, mes);
    if (!input) return;

    const original = new CommandBuilder(message);
    const vm = new NodeVM({
        eval: false,
        require: {
            external: ['MessageEmbed'],
            resolve: moduleName => join(__dirname, '../vm', moduleName),
        },
    });

    const parsed = input.split(/(-[a-z] [^-]+)/gmu).filter(s => s).map(s => s.trim());
    for (const parse of parsed) {
        const flag = /((?<key>-[a-z]) (?<value>[^-]+))/gmu.exec(parse)?.groups ?? {};

        switch (flag.key) {
            case '-n':
                original.setName(flag.value.split(/ \n/g)[0]);
                continue;

            case '-d':
                original.setDescription(parseMessage(flag.value) ?? 'None');
                continue;

            case '-f':
                if (!canCompile(mes, parseMessage(flag.value) ?? '')) return;

                original.setFunction(vm.run(new VMScript(`module.exports = ${parseMessage(flag.value) ?? ''}`).compile().code, join(__dirname, '../vm/MessageEmbed.js')));
                continue;

            case '-p':
                original.setPrivate(Boolean(flag.value));
                continue;

            default:
                embed
                    .setTitle('Bad option')
                    .setDescription('Unknown option found.')
                    .addField('Input', `${flag.key} ${flag.value}`)
                    .setColor('RED');
                mes.edit({ embed: embed, allowedMentions: { repliedUser: false } });
                return;
        }
    }

    original.buildAndRegister()
        .then(registered => {
            embed
                .setTitle('Successfully subscribed a command!')
                .setDescription(
                    `Command has been subscribed.\nSend \`${registered.name} help\` for help.\nPlease note that this command will expire in 5 minutes.\n\n`
                    + `You${registered.private ? '' : ' and your guild member'} can use your command.\nYou can also use in your DM.`,
                )
                .addField('Command ID', registered.id, true)
                .addField('Command name', registered.name, true)
                .addField('Private?', registered.private, true)
                .addField('Registered by', message.author.tag, true)
                .addField('Registered on', registered.createdAt.toLocaleString(), true)
                .setColor('BLUE')
                .setFooter('Expire at')
                .setTimestamp(new Date(registered.createdAt.getTime() + 5 * 60 * 1000));
        })
        .catch(err => {
            embed
                .setTitle('Failed to register your command')
                .setDescription(err)
                .setColor('RED');
        })
        .finally(() => mes.edit({ embed: embed, allowedMentions: { repliedUser: false } }));
}

async function interactive(message: Message, mes: Message) {
    // Get command name
    const embed = new MessageEmbed()
        .setTitle('What do you want your command name to be?')
        .setDescription('You can use _one_ any word.\nNo space are allowed.')
        .setColor('BLUE');
    mes.edit({ embed: embed, allowedMentions: { repliedUser: false } });
    const resultName = (await waitForAnswer(message))?.split(/(?=[\n ])|(?<=[\n ])/g);
    if (!resultName?.length) return timeout(mes);
    if (resultName.length > 1) {
        embed
            .setTitle('Too many inputs')
            .setDescription('You can only use **one** word for command name. Sorry')
            .addField('Your input', resultName.join(''))
            .setColor('RED');
        return mes.edit({ embed: embed, allowedMentions: { repliedUser: false } }) as unknown as void;
    }

    // Get description
    embed
        .setTitle('Please teach me a description of your command function')
        .setDescription('The sentence need to be shorter than 2048 charactors.\n'
            + 'You can also use MessageEmbed but you need to write it in javascript code block. [Reference](https://discord.js.org/#/docs/main/master/class/MessageEmbed)\n'
            + '※There are no need to import nor require `MessageEmbed`. (This will be done automatically.)');
    await mes.edit({ embed: embed, allowedMentions: { repliedUser: false } });
    const resultDescription = parseMessage(await waitForAnswer(message));
    if (!resultDescription) return timeout(mes);
    const description = await testCode(resultDescription)
        .then(res => res instanceof MessageEmbed ? res : resultDescription)
        .catch(() => resultDescription);

    // Get script that will be executed
    embed
        .setTitle('Please write Javascript code that will be executed when command are fired.')
        .setDescription(
            'Please note that the script will not be executed longer than 10 seconds.\n'
            + 'When executing, [Message](https://discord.js.org/#/docs/main/master/class/Message) is passed.\n'
            + 'You may want to start writing by...\n'
            + '```js\n'
            + 'function example(message) {\n'
            + ' // code\n'
            + '}\n'
            + '```');
    await mes.edit({ embed: embed, allowedMentions: { repliedUser: false } });
    const resultFunction = parseMessage(await waitForAnswer(message));
    if (!resultFunction) return timeout(mes);

    // Private?
    embed
        .setTitle('Do you want your command to be private?')
        .setDescription(
            'Private command can be used by anyone but you.\n'
            + 'Answer choices:\n'
            + '- 1 or true for yes\n'
            + '- 0 or false for no',
        );
    await mes.edit({ embed: embed, allowedMentions: { repliedUser: false } });
    const resultPrivate = Boolean(Number(await waitForAnswer(message)));

    return `-n ${resultName} -d ${description} -f ${resultFunction} -p ${resultPrivate}`;
}

async function waitForAnswer(message: Message) {
    const filter = (mes: Message) => mes.author === message.author;
    try {
        const collected = await message.channel.awaitMessages(filter, { max: 1, time: 600000, errors: ['time'] });
        collected.first()?.delete().catch(() => null);
        return collected.first()?.content;
    } catch (e) {
        return undefined;
    }
}

function timeout(message: Message) {
    const timeoutEmbed = new MessageEmbed()
        .setTitle('10 minutes timeout')
        .setDescription('Could not register a command because you have not respond for 10 minutes')
        .setColor('RED');
    message.edit({ embed: timeoutEmbed, allowedMentions: { repliedUser: false } });
}

function parseMessage(content?: string) {
    if (content?.includes('```')) {
        const codeBlockRegex = /^`{3}(?<lang>[a-z]+)\n(?<code>[\s\S]+)\n`{3}$/mu;
        const parsed = codeBlockRegex.exec(content)?.groups ?? {};
        return parsed.code;
    }
    return content;
}

function testCode(code: string) {
    const vm = new NodeVM({
        eval: false,
        wrapper: 'none',
        require: {
            external: ['MessageEmbed'],
            resolve: moduleName => join(__dirname, '../vm', moduleName),
        },
    });

    code = `const { MessageEmbed } = require('MessageEmbed');\nreturn ${code};`;

    try {
        return Promise.resolve(vm.run(code, join(__dirname, '../vm/MessageEmbed.js')) as unknown);
    } catch (e) {
        return Promise.reject(new Error('Function Timeout'));
    }
}

function canCompile(mes: Message, code: string) {
    try {
        new VMScript(`module.exports = ${code}`).compile();
        return true;
    } catch (e) {
        const embed = new MessageEmbed()
            .setTitle('Unable to compile function')
            .setDescription(`\`\`\`js${e}\`\`\``)
            .setColor('RED');
        mes.edit({ embed: embed, allowedMentions: { repliedUser: false } });
        return false;
    }
}
