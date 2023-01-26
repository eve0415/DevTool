import { error } from 'console';
import { DevToolBot } from './DevToolBot';

const instance = new DevToolBot();

instance.start().catch(e => error(e));

['SIGTERM', 'SIGINT'].forEach(signal =>
  process.on(signal, () => {
    instance.shutdown().catch(error);
  })
);
