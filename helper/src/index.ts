import { spawn } from 'child_process';
import { platform } from 'process';

if (platform === 'win32') throw new Error('This script is not supported on Windows');

setInterval(() => {
    console.log('----------------------------------------');
    spawn('ps', ['aux', '-o', 'pid,etime,comm,args'])
        .stdout.setEncoding('utf8')
        .on('data', console.log);
    console.log('----------------------------------------');
}, 5000);
