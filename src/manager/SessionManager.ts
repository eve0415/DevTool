import { GuildEmoji, Message, MessageReaction, ReactionEmoji, User } from 'discord.js';
import { instance } from '..';

export class SessionManager {
    private readonly userMessage: Message;
    private readonly botMessage: Message;

    public constructor(userMessage: Message, botMessage: Message) {
        if (botMessage.author.id !== instance.user?.id) throw new Error('Have to be a Message that was sent from bot!');
        this.userMessage = userMessage;
        this.botMessage = botMessage;
        this.init();
    }

    private async init() {
        const trash = '🗑️';
        const filter = (reaction: MessageReaction, user: User) => reaction.emoji.name === trash && user.id === this.userMessage.author.id;

        const userMessageReaction = await this.userMessage.react(trash);
        const botMessageReaction = await this.botMessage.react(trash);

        this.userMessage
            .awaitReactions(filter, { time: 10000, max: 1, errors: ['time'] })
            .then(collected => this.handleUserMessage(collected.first()?.emoji))
            .catch(() => userMessageReaction.remove());

        this.botMessage
            .awaitReactions(filter, { time: 10000, max: 1, errors: ['time'] })
            .then(collected => this.handleBotMessage(collected.first()?.emoji))
            .catch(() => botMessageReaction.remove());
    }

    private handleUserMessage(emoji: GuildEmoji | ReactionEmoji | undefined) {
        console.log(emoji);
        if (!emoji) return;
        if (emoji.name === '🗑️') {
            this.botMessage.delete().catch(() => null);
            this.userMessage.delete().catch(() => null);
        }
    }

    private handleBotMessage(emoji: GuildEmoji | ReactionEmoji | undefined) {
        console.log(emoji);
        if (!emoji) return;
        if (emoji.name === '🗑️') {
            this.botMessage.delete().catch(() => null);
        }
    }
}
