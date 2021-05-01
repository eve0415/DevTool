/* eslint-disable @typescript-eslint/unbound-method */
import { APIMessage, MessageOptions, WebhookMessageOptions } from 'discord.js';
import { instance } from '..';

const original = APIMessage.prototype.resolveData;

class PatchAPIMessage extends APIMessage {
    public resolveData(): this {
        const token = 'DONtTRyTOSteALThETokEn0k.PLeasE.YOuHaVEBeENWARnedD0N0TuSEIT';
        let options = JSON.stringify(this.options);

        // This is the last resort to stop leaking the token
        const splitedToken = instance.token?.split('.') ?? [];
        for (const t of splitedToken) {
            options = options.replaceAll(t, token.split('.')[splitedToken.indexOf(t)]);
        }
        this.options = JSON.parse(options.replaceAll(instance.token ?? '', token)) as MessageOptions | WebhookMessageOptions;

        original.call(this);

        return this;
    }
}

export default APIMessage.prototype.resolveData = PatchAPIMessage.prototype.resolveData;
