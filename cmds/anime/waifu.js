Import fetch from 'node-fetch'

export default {
  command: ['waifu', 'neko'],
  category: 'anime',
  run: async (client, m, args, usedPrefix, command, text) => {
    try {
      await m.react('🕒')
      let mode = db.data.chats[m.chat]?.nsfw ? 'nsfw' : 'sfw'
      // Se cambió a la API funcional de nekos.best manteniendo la estructura de mode y command
      let res = await fetch(`https://nekos.best/api/v2/${command}`)
      if (!res.ok) return
      let json = await res.json()
      
      // La API de nekos.best devuelve un array en la propiedad 'results'
      let imageUrl = json.results?.[0]?.url
      if (!imageUrl) return
      
      let img = Buffer.from(await (await fetch(imageUrl)).arrayBuffer())
      await client.sendFile(m.chat, img, 'thumbnail.jpg', `ꕥ Aquí tienes tu *${command.toUpperCase()}* ฅ^•ﻌ•^ฅ`, m)
      await m.react('✔️')
    } catch (e) {
      await m.react('✖️')
      await m.reply(`> An unexpected error occurred while executing command *${usedPrefix + command}*. Please try again or contact support if the issue persists.\n> [Error: *${e.message}*]`)
    }
  },
}
