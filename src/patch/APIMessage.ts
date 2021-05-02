/* eslint-disable @typescript-eslint/unbound-method */
import { APIMessage, MessageOptions, WebhookMessageOptions } from 'discord.js';
import { instance } from '..';

const original = APIMessage.prototype.resolveData;

class PatchAPIMessage extends APIMessage {
    public resolveData(): this {
        const token = 'DONtTRyTOSteALThETokEn0k.PLeasE.YOuHaVEBeENWARnedD0N0TuSEIT';
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const cache = Object.create(this.options);
        let options = JSON.stringify(this.options);

        // This is the last resort to stop leaking the token
        const splitedToken = instance.token?.split('.') ?? [];
        for (const t of splitedToken) {
            options = options.replaceAll(t, token.split('.')[splitedToken.indexOf(t)]);
        }
        this.options = JSON.parse(options.replaceAll(instance.token ?? '', token)) as MessageOptions | WebhookMessageOptions;

        // TODO: Check for file strings
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-member-access
        this.options.files = cache.files;

        original.call(this);

        return this;
    }
}

export default APIMessage.prototype.resolveData = PatchAPIMessage.prototype.resolveData;
