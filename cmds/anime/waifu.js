import fetch from 'node-fetch'

export default {
  command: ['waifu', 'neko'],
  category: 'anime',
  run: async (client, m, args, usedPrefix, command, text) => {
    try {
      await m.react('🕒')
      let mode = db.data.chats[m.chat]?.nsfw ? 'nsfw' : 'sfw'
      let res = await fetch(`https://nekos.best/api/v2/${command}`)
      if (!res.ok) return
      let json = await res.json()
      if (!json.results[0].url) return

      let img = Buffer.from(await (await fetch(json.results[0].url)).arrayBuffer())

      await client.sendMessage(m.chat, {
        image: img,
        caption: `ꕥ Aquí tienes tu *${command.toUpperCase()}* ฅ^•ﻌ•^ฅ`
      }, { quoted: m })

      await m.react('✔️')
    } catch (e) {
      await m.react('✖️')
      await m.reply(`> An unexpected error occurred while executing command *${usedPrefix + command}*. Please try again or contact support if the issue persists.\n> [Error: *${e.message}*]`)
    }
  },
}
