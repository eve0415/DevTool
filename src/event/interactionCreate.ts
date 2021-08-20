import { inspect } from 'util';
import { DiscordAPIError, Interaction } from 'discord.js';
import { DevToolBot } from '../DevToolBot';
import { Event } from '../interface';

export default class extends Event {
    public constructor(protected readonly client: DevToolBot) {
        super(client, __filename);
    }

    public async run(interaction: Interaction): Promise<void> {
        this.logger.trace('Recieved interaction event');

        try {
            if (interaction.isCommand()) {
                await this.client.commandManager.get(interaction.commandName)?.run(interaction);
            }
            if (interaction.isContextMenu()) {
                await this.client.commandManager.get(interaction.commandName)?.run(interaction);
            }
        } catch (e) {
            this.logger.error(e);

            const exec = /^\/webhooks\/\d+\/(?<token>.+)\/messages\/@original$/.exec((e as DiscordAPIError).path)?.groups ?? {};

            if (interaction.isCommand()) {
                await interaction.editReply({
                    embeds: [{
                        color: 'RED',
                        title: 'An Error Occured When Sending A Message',
                        description: inspect(e, { depth: 1, maxArrayLength: null })
                            .substring(0, 4096)
                            .replace(exec.token, '*redacted*'),
                    }],
                });
            }
        }
    }
}
