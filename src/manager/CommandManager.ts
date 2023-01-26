import { Collection } from 'discord.js';
import log4js from 'log4js';
import type { DevToolBot } from '../DevToolBot';
import type { Command } from '../interface';

export class CommandManager extends Collection<string, Command> {
  private readonly logger = log4js.getLogger('CommandManager');

  public constructor(private readonly client: DevToolBot) {
    super();
  }

  public async registerAll(): Promise<void> {
    this.logger.info('Starting to register all commands');
    await import('../commands/docs').then(i =>
      this.set('docs', new i.default(this.client))
    );
    await import('../commands/help').then(i =>
      this.set('help', new i.default(this.client))
    );
    await import('../commands/lint').then(i =>
      this.set('整形', new i.default(this.client))
    );
    await import('../commands/run').then(i =>
      this.set('実行', new i.default(this.client))
    );
    this.logger.info(`Successfully registered ${this.size} commands`);
  }

  public async subscribe(): Promise<void> {
    const subscribed =
      (await this.client.application?.commands.fetch()) ?? new Collection();

    const diffAdded = this.filter(
      c => !subscribed.find(s => s.name === c.data.name)
    );
    const diffRemoved = subscribed.filter(
      s => !this.find(c => s.name === c.data.name)
    );
    const diff = this.filter(
      c =>
        !(subscribed.find(s => s.name === c.data.name)?.equals(c.data) ?? false)
    );

    await Promise.allSettled([
      ...diffAdded.mapValues(add =>
        this.client.application?.commands.create(add.data)
      ),
      ...diffRemoved.mapValues(remove =>
        this.client.application?.commands.delete(remove.id)
      ),
      ...diff.mapValues(change => {
        const id = subscribed.find(s => s.name === change.data.name)?.id;
        if (id) return this.client.application?.commands.edit(id, change.data);
      }),
    ]);
  }
}
