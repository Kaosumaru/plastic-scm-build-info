import {EmbedBuilder, WebhookClient} from 'discord.js'
import {Changelog, ChangelogEntry} from './changelog'

function logToEmbed(entry: ChangelogEntry): EmbedBuilder {
  const builder = new EmbedBuilder()
    .setTitle(entry.title)
    .setDescription(entry.description)
    .setColor(9080316)

  if (entry.url) builder.setURL(entry.url)
  return builder
}

export async function sendChangelog(
  content: string,
  log: Changelog,
  webhook: string
): Promise<void> {
  const webhookClient = new WebhookClient({url: webhook})
  await webhookClient.send({
    content,
    embeds: log.entries.map(logToEmbed)
  })
}
