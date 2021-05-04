import axios from 'axios';
import { Message, MessageEmbed } from 'discord.js';
import { SystemCommandBuilder } from '../CommandBuilder';

new SystemCommandBuilder()
    .setName('docs')
    .setDescription('Show DJS document, base on your input')
    .setFunction(docs)
    .buildAndRegister();

async function docs(message: Message, args: string[]) {
    if (!args.length) message.reply({ embed: { title: 'Missing inputs', description: 'You have forgotten to send what you want to search for', color: 'RED' }, allowedMentions: { repliedUser: false } });
    const response = await axios.get<MessageEmbed>('https://djsdocs.sorta.moe/v2/embed', { params: { src: 'master', q: args.join(' ') } });
    if (response.data) return message.reply({ embed: response.data, allowedMentions: { repliedUser: false } });
    message.reply({ embed: { title: '404 Not found', description: 'I couldn\'t find what you were looking for.', color: 'RED' }, allowedMentions: { repliedUser: false } });
}
