import { Message, MessageEmbed, Snowflake } from 'discord.js';
import { BaseCommandBuilder } from '../api';

export class Command {
    public name: string;
    public description: string | MessageEmbed;
    public madeBy: Snowflake;
    public madeIn: Snowflake | null;
    public createdAt = new Date();
    public updatedAt = new Date();
    public execute: (message: Message, arg: string[]) => unknown;
    private commandNo!: number;
    private enabled = false;

    public constructor(command: BaseCommandBuilder) {
        this.name = command.name;
        this.description = command.description;
        this.madeBy = command.madeBy;
        this.madeIn = command.madeIn;
        this.execute = command.execute;
    }

    public set isEnabled(enabled: boolean) {
        this.enabled = enabled;
    }

    public get isEnabled(): boolean {
        return this.enabled;
    }

    public set id(id: number) {
        this.commandNo = id;
    }

    public get id(): number {
        return this.commandNo;
    }

    public async wantHelp(message: Message): Promise<void> {
        const embed = new MessageEmbed()
            .setTitle(this.name)
            .setDescription(this.description)
            .addField('Created by', await this.resolveUser(message));

        message.reply(embed, { allowedMentions: { repliedUser: false } });
    }

    private async resolveUser(message: Message): Promise<string> {
        if (this.madeBy === '0') return 'System';
        if (this.madeBy === message.author.id) return message.author.toString();
        const member = await message.guild?.members.fetch(this.madeBy);
        return member ? member?.toString() : 'Unknown';
    }
}
