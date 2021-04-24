import { Message, MessageEmbed, Snowflake } from 'discord.js';
import { Command } from '../interfaces';
import { CommandManager } from '../manager';

export abstract class BaseCommandBuilder {
    public name!: string;
    public description!: string | MessageEmbed;
    public madeBy!: Snowflake;
    public madeIn!: Snowflake | null;
    public private = false;
    public execute!: (message: Message, arg: string[]) => unknown;

    public setName(name: string): this {
        this.name = name;
        return this;
    }

    public setDescription(desc: string | MessageEmbed): this {
        this.description = desc;
        return this;
    }

    public setFunction(func: (message: Message, arg: string[]) => unknown): this {
        this.execute = func;
        return this;
    }

    public buildAndRegister(): Command {
        return CommandManager.register(new Command(this));
    }
}
