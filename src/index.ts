import { DevToolBot } from './DevToolBot';

export const instance = new DevToolBot();

instance.start().catch(e => console.error(e));
