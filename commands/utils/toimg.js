export default {
    command: ['toimg', 'tovideo', 'tomp4'],
    category: 'tools',
    run: async (client, m, { usedPrefix, command }) => {
        const q = m.quoted ? m.quoted : m
        const mime = (q.msg || q).mimetype || ''

        if (!/webp/.test(mime)) return client.reply(m.chat, `《✧》 Responde a un sticker.`, m)

        await m.react('🕒')
        try {
            const media = await q.download()
            const isAnimated = q.isAnimated || q.msg?.isAnimated

            if (isAnimated) {
                // Intentamos usar un conversor que acepta base64 directo en la URL
                // Esto a veces evita el bloqueo de red porque parece una petición de imagen normal
                const base64 = media.toString('base64')
                const apiUrl = `https://api.lolhuman.xyz/api/convert/webptomp4?apikey=GataDios&img=${encodeURIComponent(base64)}`
                
                // Enviamos el mensaje usando la URL directa. 
                // Baileys (la librería del bot) se encargará de descargarla.
                await client.sendMessage(m.chat, { 
                    video: { url: apiUrl }, 
                    caption: 'ꕥ *Aquí tienes tu video ฅ^•ﻌ•^ฅ*' 
                }, { quoted: m })
                
            } else {
                // Imagen estática (funciona bien)
                await client.sendMessage(m.chat, { image: media, caption: 'ꕥ *Aquí tienes tu imagen ฅ^•ﻌ•^ฅ*' }, { quoted: m })
            }
            await m.react('✔️')
        } catch (e) {
            console.error(e)
            await m.react('✖️')
            client.reply(m.chat, `《✧》 Tu servidor no permite procesar videos ni conectar con conversores externos.`, m)
        }
    }
}
