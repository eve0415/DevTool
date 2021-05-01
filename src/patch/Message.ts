import { Client, DMChannel, Message, NewsChannel, Structures, TextChannel } from 'discord.js';

export class PatchMessage extends Message {
    constructor(_client: Client, data: { [key: string]: unknown }, channel: TextChannel | DMChannel | NewsChannel) {
        const emptyClient = new Client({ intents: [] });
        super(emptyClient, data, channel);
    }
}

export default Structures.extend('Message', () => PatchMessage);
