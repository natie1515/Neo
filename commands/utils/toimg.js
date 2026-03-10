import { spawn } from 'child_process'
import fs from 'fs'
import path from 'path'
import { tmpdir } from 'os'
import Crypto from 'crypto'

export default {
    command: ['toimg', 'tovideo', 'tomp4'],
    category: 'tools',
    run: async (client, m, { usedPrefix, command }) => {
        // 1. Mejoramos la detección del sticker citado
        const q = m.quoted ? m.quoted : m
        const mime = (q.msg || q).mimetype || ''

        if (!/webp/.test(mime)) {
            return client.reply(m.chat, `《✧》 Responde a un **sticker** para convertirlo.`, m)
        }

        await m.react('🕒')
        let media = await q.download()
        
        if (!media) {
            await m.react('✖️')
            return client.reply(m.chat, `《✧》 No se pudo descargar el sticker.`, m)
        }

        // 2. Determinar si es animado (Video) o estático (Imagen)
        // Usamos la propiedad isAnimated o el tipo de mensaje
        const isAnimated = q.isAnimated || q.msg?.isAnimated

        if (isAnimated) {
            // --- PROCESO PARA VIDEO ---
            try {
                const tmpFileIn = path.join(tmpdir(), `${Crypto.randomBytes(6).readUIntLE(0, 6).toString(36)}.webp`)
                const tmpFileOut = path.join(tmpdir(), `${Crypto.randomBytes(6).readUIntLE(0, 6).toString(36)}.mp4`)
                
                fs.writeFileSync(tmpFileIn, media)

                const process = spawn('ffmpeg', [
                    '-i', tmpFileIn,
                    '-movflags', 'faststart',
                    '-pix_fmt', 'yuv420p',
                    '-vf', 'scale=trunc(iw/2)*2:trunc(ih/2)*2',
                    tmpFileOut
                ])

                process.on('close', async (code) => {
                    if (code === 0) {
                        const videoBuffer = fs.readFileSync(tmpFileOut)
                        await client.sendMessage(m.chat, { video: videoBuffer, caption: 'ꕥ *Aquí tienes tu video ฅ^•ﻌ•^ฅ*' }, { quoted: m })
                        await m.react('✔️')
                    } else {
                        await m.react('✖️')
                        client.reply(m.chat, '《✧》 Error en la conversión de video.', m)
                    }
                    if (fs.existsSync(tmpFileIn)) fs.unlinkSync(tmpFileIn)
                    if (fs.existsSync(tmpFileOut)) fs.unlinkSync(tmpFileOut)
                })
            } catch (e) {
                await m.react('✖️')
                console.error(e)
            }
        } else {
            // --- PROCESO PARA IMAGEN ---
            await client.sendMessage(m.chat, { image: media, caption: 'ꕥ *Aquí tienes tu imagen ฅ^•ﻌ•^ฅ*' }, { quoted: m })
            await m.react('✔️')
        }
    }
}
