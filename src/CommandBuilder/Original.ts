import { Message } from 'discord.js';
import { BaseCommandBuilder } from './Base';

export class CommandBuilder extends BaseCommandBuilder {
    public constructor(message: Message) {
        super();
        this.madeBy = message.author.id;
        this.madeIn = message.guild?.id ?? null;
    }

    public setPrivate(bool: boolean): void {
        this.private = bool;
    }
}
