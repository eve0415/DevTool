export class Brainfuck {
  private readonly block = [0];
  private pointer = 0;
  private readonly input: string;
  private output = '';

  public constructor(input: string) {
    this.input = input.replaceAll(/[^+-[\].,<>]+/g, '');
  }

  public execute(): string {
    for (let i = 0; i < this.input.length; i++) {
      i = this.run(i);
    }
    return this.output;
  }

  private run(int: number): number {
    switch (this.input[int]) {
      case '+':
        this.block[this.pointer]++;
        break;

      case '-':
        this.block[this.pointer]--;
        break;

      case '[':
        int = this.loop(int);
        if (int > this.input.length) throw new TypeError('`]` が足りません。');
        break;

      case ']':
        throw new TypeError('`[` が足りません。');

      case '>':
        this.pointer++;
        if (this.block.length < this.pointer + 1) {
          this.block.push(0);
        }
        break;

      case '<':
        this.pointer--;
        break;

      case '.':
        this.output = `${this.output}${String.fromCharCode(
          this.block[this.pointer] ?? 0
        )}`;
        break;
    }
    return int;
  }

  private loop(int: number): number {
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
}
