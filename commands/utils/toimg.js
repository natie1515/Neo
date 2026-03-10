import { webp2mp4 } from '../../lib/webp2mp4.js'

export default {
    command: ['toimg', 'tovideo', 'tomp4'],
    category: 'tools',
    run: async (client, m, { usedPrefix, command }) => {
        const q = m.quoted ? m.quoted : m
        const mime = (q.msg || q).mimetype || ''

        if (!/webp/.test(mime)) return client.reply(m.chat, `《✧》 Responde a un sticker.`, m)

        await m.react('🕒')
        try {
            let media = await q.download()
            const isAnimated = q.isAnimated || q.msg?.isAnimated

            if (isAnimated) {
                // Conversión de Sticker Animado a Video
                const out = await webp2mp4(media)
                await client.sendMessage(m.chat, { video: { url: out }, caption: 'ꕥ *Aquí tienes tu video ฅ^•ﻌ•^ฅ*' }, { quoted: m })
            } else {
                // Conversión de Sticker Estático a Imagen
                await client.sendMessage(m.chat, { image: media, caption: 'ꕥ *Aquí tienes tu imagen ฅ^•ﻌ•^ฅ*' }, { quoted: m })
            }
            await m.react('✔️')
            
        } catch (e) {
            console.error(e)
            await m.react('✖️')
            client.reply(m.chat, `《✧》 Ocurrió un error: ${e.message}`, m)
        }
    }
}
