import { webp2mp4 } from '../lib/webp2mp4.js'

export default {
  command: ['tovideo', 'tomp4', 'togif'],
  category: 'tools',
  run: async (client, m, { usedPrefix, command }) => {
    // 1. Validar que se esté citando algo
    const q = m.quoted ? m.quoted : m
    const mime = (q.msg || q).mimetype || ''

    // 2. Verificar que sea un sticker (webp)
    if (!/webp/.test(mime)) {
      return client.reply(m.chat, `《✧》 Debes citar un *sticker animado* para convertirlo a video.`, m)
    }

    await m.react('🕒')

    try {
      // 3. Descargar el contenido del sticker
      let media = await q.download()
      
      // 4. Conversión usando la librería webp2mp4
      let videoUrl = await webp2mp4(media)

      if (!videoUrl) {
        await m.react('✖️')
        return client.reply(m.chat, `《✧》 Error: No se pudo obtener la URL del video.`, m)
      }

      // 5. Enviar el resultado al chat
      await client.sendMessage(m.chat, { 
        video: { url: videoUrl }, 
        caption: 'ꕥ *Conversión exitosa ฅ^•ﻌ•^ฅ*' 
      }, { quoted: m })

      await m.react('✔️')

    } catch (e) {
      console.error(e)
      await m.react('✖️')
      client.reply(m.chat, `《✧》 Ocurrió un fallo en la conversión. Asegúrate de que el sticker sea animado.`, m)
    }
  }
}
