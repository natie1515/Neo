import yts from 'yt-search'
import fetch from 'node-fetch'
import { getBuffer } from '../../core/message.js'

const isYTUrl = (url) =>
  /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/i.test(url)

export default {
  command: ['play2', 'mp4', 'ytmp4', 'ytvideo', 'playvideo'],
  category: 'downloader',

  run: async (client, m, args, usedPrefix, command) => {
    try {
      if (!args[0]) {
        return m.reply(
          '《✧》Por favor, menciona el nombre o URL del video que deseas descargar'
        )
      }

      const text = args.join(' ')

      const videoMatch = text.match(
        /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/|live\/|v\/))([a-zA-Z0-9_-]{11})/
      )

      const query = videoMatch
        ? 'https://youtu.be/' + videoMatch[1]
        : text

      let url = query
      let title = null
      let thumbBuffer = null

      try {
        const search = await yts(query)

        if (search.all.length) {
          const videoInfo = videoMatch
            ? search.videos.find(v => v.videoId === videoMatch[1]) || search.all[0]
            : search.all[0]

          if (videoInfo) {
            url = videoInfo.url
            title = videoInfo.title

            thumbBuffer = await getBuffer(videoInfo.image)

            const vistas = (videoInfo.views || 0).toLocaleString()
            const canal = videoInfo.author?.name || 'Desconocido'

            const infoMessage = `➩ Descargando › *${title}*

> ❖ Canal › *${canal}*
> ⴵ Duración › *${videoInfo.timestamp || 'Desconocido'}*
> ❀ Vistas › *${vistas}*
> ✩ Publicado › *${videoInfo.ago || 'Desconocido'}*
> ❒ Enlace › *${url}*`

            await client.sendMessage(
              m.chat,
              {
                image: thumbBuffer,
                caption: infoMessage
              },
              { quoted: m }
            )
          }
        }
      } catch (err) {}

      // NUEVA API MP4
      const endpoint =
        `https://api.stellarwa.xyz/dl/ytmp4?url=${encodeURIComponent(url)}&key=nekotina`

      const controller = new AbortController()

      const timeout = setTimeout(() => {
        controller.abort()
      }, 10000)

      const res = await fetch(endpoint, {
        signal: controller.signal,
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Linux; Android 15; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36',
          'Accept': 'application/json'
        }
      }).then(r => r.json())

      clearTimeout(timeout)

      // EXTRAER LINK
      const videoUrl =
        res?.result?.downloadUrl ||
        res?.data?.dl ||
        res?.result?.download ||
        res?.download ||
        res?.url

      if (!videoUrl) {
        return m.reply(
          '《✧》 No se pudo descargar el *video*, intenta más tarde.'
        )
      }

      const videoBuffer = await getBuffer(videoUrl)

      await client.sendMessage(
        m.chat,
        {
          video: videoBuffer,
          fileName:
            res?.result?.title ||
            `${title || 'video'}.mp4`,
          mimetype: 'video/mp4'
        },
        { quoted: m }
      )

    } catch (e) {
      await m.reply(
        `> An unexpected error occurred while executing command *${usedPrefix + command}*. Please try again or contact support if the issue persists.\n> [Error: *${e.message}*]`
      )
    }
  }
}
