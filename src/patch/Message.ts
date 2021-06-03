/* eslint-disable @typescript-eslint/unbound-method */
import { Client, DMChannel, GuildChannel, Message as IMessage, NewsChannel, Structures, TextChannel } from 'discord.js';
import { instance } from '..';
import { SessionManager } from '../manager';

declare module 'discord.js' {
    interface Message {
        extendedReply(
            content: string | null | (ReplyMessageOptions & { split?: false }) | MessageAdditions,
        ): Promise<Message>;
        extendedReply(options: ReplyMessageOptions & { split: true | SplitOptions }): Promise<Message[]>;
        extendedReply(options: ReplyMessageOptions | APIMessage): Promise<Message | Message[]>;
        extendedReply(
            content: string | null,
            options: (ReplyMessageOptions & { split?: false }) | MessageAdditions,
        ): Promise<Message>;
        extendedReply(
            content: string | null,
            options: ReplyMessageOptions & { split: true | SplitOptions },
        ): Promise<Message[]>;
        extendedReply(content: string | null, options: ReplyMessageOptions): Promise<Message | Message[]>;
    }
}

export class PatchMessage extends IMessage {
    public constructor(_: never, data: { [key: string]: unknown }, channel: TextChannel | DMChannel | NewsChannel) {
        const emptyClient = new Client({ intents: [] });
        emptyClient.user = instance.user;
        super(emptyClient, data, channel);
    }

    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types,@typescript-eslint/no-explicit-any
    public extendedReply(content: any, options?: any): any {
        const message = options ? this.reply(content, options) : this.reply(content);

        if (!this.guild?.me) return message;
        if ((this.channel as GuildChannel).permissionsFor(this.guild.me).has('MANAGE_MESSAGES')) {
            message.then(mes => {
                const clonedUserMessage = Object.defineProperty(Object.assign(Object.create(this), this), 'client', { value: instance }) as IMessage;
                const clonedBotMessage = Object.defineProperty(Object.assign(Object.create(mes), mes), 'client', { value: instance }) as IMessage;
                new SessionManager(clonedUserMessage, clonedBotMessage);
            });
        }

        return message;
    }
}

export default Structures.extend('Message', () => PatchMessage);
