import { Collection, DMChannel, Message, Snowflake, TextChannel } from 'discord.js';
import { JSEvaluationManager, PythonEvaluationManager } from '../evaluation';
import { BaseEvaluation, PLanguage } from '../interfaces';

export class EvaluationManager extends Collection<PLanguage, BaseEvaluation<unknown>> {
    public constructor() {
        super();
        this.set('js', new JSEvaluationManager());
        this.set('py', new PythonEvaluationManager());
    }

    public startEvaluate(channel: TextChannel | DMChannel, lang: PLanguage): void {
        this.get(lang)?.startEvaluate(channel);
    }

    public evaluateCode(message: Message, content: string, lang: PLanguage): void {
        this.get(lang)?.evaluateCode(message, content);
    }

    public killEvaluate(channel: TextChannel | DMChannel): void {
        this.getEvaluatingLanguage(channel.id)?.killEvaluate(channel);
    }

    public evaluateOnce(message: Message, content: string, lang: PLanguage): void {
        this.get(lang)?.evaluateOnce(message, content);
    }

    public isEvaluating(channel: Snowflake): boolean {
        return !!this.find(e => e.has(channel));
    }

    public getEvaluatingLanguage(channel: Snowflake): BaseEvaluation<unknown> | undefined {
        return this.find(e => e.has(channel));
    }
}
