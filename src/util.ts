import type { ColorResolvable } from 'discord.js';
import { AttachmentBuilder, EmbedBuilder } from 'discord.js';

export function createMessageFromText(
  result: string,
  {
    title,
    embedColor,
    lang,
    showTitleOnEmbed = false,
  }: { title: string; embedColor: ColorResolvable; lang?: string, showTitleOnEmbed?:boolean }
) {
  if (result.length <= 4080) {
    const embed = new EmbedBuilder()
      .setColor(embedColor)
      .setDescription(`\`\`\`${lang ?? ''}\n${result}\n\`\`\``)
      .setTitle(showTitleOnEmbed ? title : null);
    return { embeds: [embed] };
  }

  const content = `${title}です。ファイルをご覧ください。${
    Buffer.from(result).byteLength / 1024 / 1024 > 8
      ? '\nファイルの容量が8MBを超えたため、一部の結果が省略されています'
      : ''
  }`;

  while (Buffer.from(result).byteLength / 1024 / 1024 > 8) {
    const cache = result.split('\n');

    result =
      (cache.length === 1
        ? cache[0]?.substring(
            cache[0].length - Number(cache[0].length.toString().slice(0, -1))
          )
        : cache
            .splice(
              0,
              cache.length - Number(cache.length.toString().slice(0, -1))
            )
            .join('\n')) ?? '';
  }

  return {
    title: showTitleOnEmbed ? title : undefined,
    content,
    files: [new AttachmentBuilder(Buffer.from(result), { name: 'result.txt' })],
  };
}
