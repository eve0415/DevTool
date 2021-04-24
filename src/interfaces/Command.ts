import { Message, MessageEmbed, Snowflake } from 'discord.js';
import { BaseCommandBuilder } from '../CommandBuilder';

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
        this.madeIn = command.private ? '' : command.madeIn;
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
        const embed = this.description instanceof MessageEmbed ? this.description : new MessageEmbed();
        if (!embed.title) embed.setTitle(this.name);
        if (!embed.description) embed.setDescription(this.description);
        if (!embed.color) embed.setColor('BLUE');
        if (!embed.footer) embed.setFooter(`Created by ${await this.resolveUser(message)}(${this.madeBy}). Command ID: ${this.id}`);

        message.reply({ embed: embed, allowedMentions: { repliedUser: false } });
    }

    private async resolveUser(message: Message): Promise<string> {
        if (this.madeBy === '0') return 'System';
        if (this.madeBy === message.author.id) return message.author.toString();
        const member = await message.guild?.members.fetch(this.madeBy);
        return member ? member?.toString() : 'Unknown';
    }
}
