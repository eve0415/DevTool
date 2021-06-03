import { Message, MessageEmbed } from 'discord.js';
import { SystemCommandBuilder } from '../CommandBuilder';

const commandRegex = /^toString\((?<option>.+?)?\)$/u;

const helpMessage = `
__Change Embed to usual message__

Are you using your mobile or table but want to copy some text from Embed?
Here is your solution!

Reply to the embed with \`toString()\`

There are some options for filtering out from embeds
toString(title | description | fields | field[number])
`;

new SystemCommandBuilder()
    .setName(commandRegex)
    .setHumanReadable('toString()')
    .setDescription('Change Embed message to usual message')
    .setFunction(toString)
    .buildAndRegister();

function toString(message: Message) {
    const option = commandRegex.exec(message.content)?.groups?.option ?? '';
    const embed = new MessageEmbed();
    if (!message.reference) {
        return message.extendedReply({
            embed: embed
                .setColor('RED')
                .setTitle('Missing reference')
                .setDescription(helpMessage),
        });
    }
    const referenced = message.reference.messageID ? message.channel.messages.resolve(message.reference.messageID) : null;
    if (!referenced || !referenced.embeds.length) {
        return message.extendedReply({
            embed: embed
                .setColor('RED')
                .setTitle('There was an error reading reference message')
                .setDescription('Sorry, there was an error reading reference message. Is message or embeds deleted? Do I have a permission to access?'),
        });
    }
    const textArray: string[] = [];
    for (const e of referenced.embeds) {
        if (e.title && (!option || option === 'title')) textArray.push(e.title);
        if (e.description && (!option || ['desc', 'description'].indexOf(option) >= 0)) textArray.push(e.description);
        if (!option || option === 'fields') {
            for (const field of e.fields) {
                textArray.push(`${field.name}: ${field.value}`);
            }
        }
        if (/field\[(?<number>\d)\]/.test(option)) {
            const arrayNumber = Number(/field\[(?<number>\d)\]/.exec(option)?.groups?.number ?? '');
            textArray.push(`${e.fields[arrayNumber].name}: ${e.fields[arrayNumber].value}`);
        }
    }
    if (!textArray.length) textArray.push('undefined');
    message.extendedReply(textArray.join('\n'));
}
