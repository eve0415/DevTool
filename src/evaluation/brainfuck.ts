import type { ReplyMessageOptions } from 'discord.js';
import { BaseEvaluationSystem } from './base';

export class BrainfuckEvaluationSystem extends BaseEvaluationSystem {
    public evaluate(content: string): Promise<ReplyMessageOptions> {
        return new Promise(res => {
            if (content.includes(',')) return res(this.createErrorMessage(new TypeError('`,`は使用できません。')));

            try {
                res(this.createMessage(['', ...new Brainfuck(content).execute().split(' ')], 'text'));
            } catch (e) {
                res(this.createErrorMessage(e as TypeError));
            }
        });
    }
}

class Brainfuck {
    private readonly block = [0];
    private pointer = 0;
    private readonly input: string;
    private output = '';

    public constructor(input: string) {
        this.input = input.replaceAll(/[^+-[\].,<>]+/g, '');
        console.log(this.input);
    }

    public execute() {
        for (let i = 0; i < this.input.length; i++) {
            i = this.run(i);
        }
        console.log(this.output);
        return this.output;
    }

    private run(int: number) {
        switch (this.input[int]) {
            case '+':
                this.increment();
                break;

            case '-':
                this.decrement();
                break;

            case '[':
                int = this.loop(int);
                if (int > this.input.length) throw new TypeError('`]` が足りません。');
                break;

            case ']':
                throw new TypeError('`[` が足りません。');

            case '>':
                this.incrementPointer();
                break;

            case '<':
                this.decrementPointer();
                break;

            case '.':
                this.output = `${this.output}${String.fromCharCode(this.block[this.pointer] as number)}`;
                break;
        }
        return int;
    }

    private loop(int: number) {
        if (this.block[this.pointer] === 0) {
            while (this.input[int] !== ']' && int <= this.input.length) int++;
            return int;
        }

        int++;
        const c = Number(int);
        while (int < this.input.length) {
            if (int === this.input.length) {
                int++;
                return int;
            }
            if (this.input[int] === ']') {
                if (this.block[this.pointer] === 0) break;
                int = c;
            }
            int = this.run(int);
            int++;
        }
        return int;
    }

    private increment() {
        this.block[this.pointer]++;
    }

    private decrement() {
        this.block[this.pointer]--;
    }

    private incrementPointer() {
        this.pointer++;
        if (this.block.length < this.pointer + 1) {
            this.block.push(0);
        }
    }

    private decrementPointer() {
        this.pointer--;
        if (this.block.length < this.pointer + 1) {
            this.block.push(0);
        }
    }
}
