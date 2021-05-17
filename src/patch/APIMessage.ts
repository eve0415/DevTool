/* eslint-disable @typescript-eslint/unbound-method */
import { APIMessage, MessageAttachment, MessageOptions, WebhookMessageOptions } from 'discord.js';
import { instance } from '..';

const original = APIMessage.prototype.resolveData;

class PatchAPIMessage extends APIMessage {
    public resolveData(): this {
        const token = 'DONtTRyTOSteALThETokEn0k.PLeasE.YOuHaVEBeENWARnedD0N0TuSEIT';
        const cache = Object.create(this.options) as MessageOptions | WebhookMessageOptions;
        let options = JSON.stringify(this.options);

        // This is the last resort to stop leaking the token
        const splitedToken = instance.token?.split('.') ?? [];
        for (const t of splitedToken) {
            options = options.replaceAll(t, token.split('.')[splitedToken.indexOf(t)]);
        }

        this.options = JSON.parse(options.replaceAll(instance.token ?? '', token)) as MessageOptions | WebhookMessageOptions;
        this.options.files = cache.files?.map(c => {
            for (const t of splitedToken) {
                if (c instanceof MessageAttachment) {
                    c.name = c.name?.replaceAll(t, token.split('.')[splitedToken.indexOf(t)]) ?? null;
                    c.attachment = Buffer.from(c.attachment.toString().replaceAll(t, token.split('.')[splitedToken.indexOf(t)]));
                }
            }
            return c;
        });
        if (!this.isWebhook) (this.options as MessageOptions).reply = (cache as MessageOptions).reply;
        if (this.options.allowedMentions?.repliedUser === undefined) this.options.allowedMentions = { repliedUser: false };

        original.call(this);

        return this;
    }
}

export default APIMessage.prototype.resolveData = PatchAPIMessage.prototype.resolveData;
