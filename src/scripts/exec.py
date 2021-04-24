import asyncio
import sys
import textwrap
import traceback


async def main():
    try:
        data = sys.stdin.readline()
        to_run = f'async def func():\n{textwrap.indent(data, "  ")}'

        env = {}
        env.update(globals())

        exec(to_run, env)
        func = env['func']
        ret = await func()
        print(ret)
    except Exception as e:
        print(e)
        print(traceback.format_exc())

loop = asyncio.get_event_loop()
coroutine = main()
loop.run_until_complete(coroutine)
