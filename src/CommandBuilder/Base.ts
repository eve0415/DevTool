import { Message, MessageEmbed, Snowflake } from 'discord.js';
import { Command } from '../interfaces';
import { CommandManager } from '../manager';

export abstract class BaseCommandBuilder {
    public name!: string | RegExp;
    public humanReadable!: string;
    public description!: string | MessageEmbed;
    public madeBy!: Snowflake;
    public madeIn!: Snowflake | null;
    public private = false;
    public execute!: (message: Message, arg: string[]) => unknown;

    public setName(name: string | RegExp): this {
        this.name = name;
        if (typeof name === 'string') this.humanReadable = name;
        return this;
    }

    public setHumanReadable(name: string): this {
        if (typeof this.name === 'string') throw new Error('Human-Readable name can only need to be set when command name are regexp');
        this.humanReadable = name;
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

    public buildAndRegister(): Promise<Command> {
        if (!this.name) return Promise.reject(new Error('Command has no name'));
        if (!this.humanReadable) return Promise.reject(new Error('Command does not have human-readable name'));
        if (!this.description) return Promise.reject(new Error('Command has no description'));
        return CommandManager.register(new Command(this));
    }
}
