import type { DevToolBot } from '../DevToolBot';
import type { CloseEvent } from 'discord.js';
import { Event } from '../interface';

export default class extends Event {
  public constructor(client: DevToolBot) {
    super(client, 'shardDisconnect');
  }

  public run(event: CloseEvent, id: number): void {
    this.logger.info(
      `Shard: ${id} has disconnected.`,
      `Code: ${event.code}, Reason: ${event.reason}`
    );
  }
}
