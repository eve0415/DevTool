import type { DevToolBot } from '../DevToolBot';
import type {
  BaseMessageOptions,
  DiscordAPIError,
  Interaction,
} from 'discord.js';
import { inspect } from 'util';
import { Colors, InteractionType } from 'discord.js';
import { Event } from '../interface';

export default class extends Event {
  public constructor(client: DevToolBot) {
    super(client, 'interactionCreate');
  }

  public async run(interaction: Interaction): Promise<void> {
    this.logger.trace('Recieved interaction event');

    try {
      if (interaction.type === InteractionType.ApplicationCommandAutocomplete) {
        await this.client.commandManager
          .get(interaction.commandName)
          ?.autoCompletion(interaction);
      }
      if (
        interaction.isChatInputCommand() ||
        interaction.isContextMenuCommand()
      ) {
        await this.client.commandManager
          .get(interaction.commandName)
          ?.run(interaction);
      }
    } catch (e) {
      this.logger.error(e);

      const exec =
        /^\/interactions\/\d+\/(?<token>.+)\/callback$/.exec(
          (e as DiscordAPIError).url
        )?.groups ?? {};
      const message: BaseMessageOptions = {
        embeds: [
          {
            color: Colors.Red,
            title: 'An Error Occured When Sending A Message',
            description: inspect(e, { depth: 1, maxArrayLength: null })
              .substring(0, 4096)
              .replace(exec['token'] ?? 'ABCDEFGHIJKLMN', '*redacted*'),
          },
        ],
      };

      if (
        interaction.isChatInputCommand() ||
        interaction.isContextMenuCommand()
      ) {
        if (interaction.replied || interaction.deferred) {
          await interaction
            .editReply(message)
            .catch(err => this.logger.error(err));
        } else {
          await interaction.reply(message).catch(err => this.logger.error(err));
        }
      }
    }
  }
}
