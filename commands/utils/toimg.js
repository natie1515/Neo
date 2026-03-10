import ff from 'fluent-ffmpeg'
import fs from 'fs'
import path from 'path'
import { tmpdir } from 'os'
import Crypto from 'crypto'

export default {
    command: ['toimg', 'tovideo', 'tomp4'],
    category: 'tools',
    run: async (client, m, { usedPrefix, command }) => {
        const q = m.quoted ? m.quoted : m
        const mime = (q.msg || q).mimetype || ''

        if (!/webp/.test(mime)) return client.reply(m.chat, `《✧》 Responde a un sticker.`, m)

        await m.react('🕒')
        let media = await q.download()
        
        // Verificamos si es animado
        // A veces q.isAnimated es undefined, así que revisamos el buffer también
        const isAnimated = q.isAnimated || q.msg?.isAnimated

        if (isAnimated) {
            const tmpFileIn = path.join(tmpdir(), `${Crypto.randomBytes(6).readUIntLE(0, 6).toString(36)}.webp`)
            const tmpFileOut = path.join(tmpdir(), `${Crypto.randomBytes(6).readUIntLE(0, 6).toString(36)}.mp4`)
            
            fs.writeFileSync(tmpFileIn, media)

            ff(tmpFileIn)
                .outputOptions([
                    '-pix_fmt yuv420p',
                    '-vf scale=trunc(iw/2)*2:trunc(ih/2)*2',
                    '-preset fast'
                ])
                .toFormat('mp4')
                .on('error', async (err) => {
                    console.error('FFmpeg Error:', err)
                    await m.react('✖️')
                    client.reply(m.chat, `《✧》 Error al convertir video: ${err.message}`, m)
                    if (fs.existsSync(tmpFileIn)) fs.unlinkSync(tmpFileIn)
                })
                .on('end', async () => {
                    const videoBuffer = fs.readFileSync(tmpFileOut)
                    await client.sendMessage(m.chat, { video: videoBuffer, caption: 'ꕥ *Aquí tienes tu video ฅ^•ﻌ•^ฅ*' }, { quoted: m })
                    await m.react('✔️')
                    if (fs.existsSync(tmpFileIn)) fs.unlinkSync(tmpFileIn)
                    if (fs.existsSync(tmpFileOut)) fs.unlinkSync(tmpFileOut)
                })
                .save(tmpFileOut)

        } else {
            // Es un sticker estático
            await client.sendMessage(m.chat, { image: media, caption: 'ꕥ *Aquí tienes tu imagen ฅ^•ﻌ•^ฅ*' }, { quoted: m })
            await m.react('✔️')
        }
    }
}
