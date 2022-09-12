import { spawn } from 'child_process';
import { platform } from 'process';

if (platform === 'win32') throw new Error('This script is not supported on Windows');

const parentPid: string[] = [];

setInterval(() => {
    console.log('----------------------------------------');
    spawn('ps', ['aux', '-o', 'pid,etime,comm,args'])
        .stdout.setEncoding('utf8')
        .on('data', (data: string) => {
            const process = data
                .split('\n')
                .map(s => s.trim())
                .filter((v, i) => i > 0 && v)
                .map(line => {
                    const [pid, time, command, ...args] = line.split(/\s+/);
                    return { pid, time, command, args: args.slice(1) };
                });
            if (parentPid.length === 0) {
                process
                    .filter(({ command }) => command === 'node')
                    .map(({ pid }) => pid)
                    .filter((pid): pid is string => typeof pid === 'string')
                    .forEach(pid => parentPid.push(pid));
            }
            console.log(process, parentPid);
        });
    console.log('----------------------------------------');
}, 5000);
