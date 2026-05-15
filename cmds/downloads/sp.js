import fetch from 'node-fetch'

export default {
  command: ['sp', 'spotify'],
  category: 'downloader',

  run: async (sock, m, args) => {
    try {
      if (!args[0]) {
        return m.reply(
          '✎ Por favor, menciona el nombre o URL de la canción que deseas descargar de Spotify'
        )
      }

      const query = args.join(' ')

      let url
      let songInfo

      // DETECTAR LINK DE SPOTIFY
      if (/open\.spotify\.com\/track\//i.test(query)) {

        url = query

        const resInfo = await fetch(
          `https://api.stellarwa.xyz/dl/spotify?url=${encodeURIComponent(url)}&key=nekotina`
        )

        const resultInfo = await resInfo.json()

        if (!resultInfo.status) {
          return m.reply('❖ No se pudo procesar el enlace de Spotify.')
        }

        songInfo = resultInfo.data

      } else {

        // BUSCADOR SPOTIFY
        const search = await fetch(
          `https://TUAPI.com/search/spotify?query=${encodeURIComponent(query)}&key=TU_KEY_AQUI`
        )

        const data = await search.json()

        if (!data.status || !data.data.length) {
          return m.reply('❖ No se encontraron resultados en Spotify')
        }

        songInfo = data.data[0]
        url = songInfo.url
      }

      const duracion =
        (!songInfo.duration || songInfo.duration.includes('NaN'))
          ? 'Desconocida'
          : songInfo.duration || ''

      const caption = `➪ Descargando › ${songInfo.title || songInfo.name}

> ✿⃘࣪◌ ֪ Artista › ${songInfo.artist || ""}
> ✿⃘࣪◌ ֪ Álbum › ${songInfo.album || ""}
> ✿⃘࣪◌ ֪ Fecha › ${songInfo.publish || songInfo.year || ""}
> ✿⃘࣪◌ ֪ Duración › ${duracion}
> ✿⃘࣪◌ ֪ Enlace › ${url || ""}

𐙚 ❀ ｡ ↻ El archivo se está enviando, espera un momento... ˙𐙚`

      const yi = songInfo.image || songInfo.cover

      await sock.sendMessage(
        m.chat,
        {
          image: { url: yi },
          caption
        },
        { quoted: m }
      )

      // DESCARGAR AUDIO
      const resAudio = await fetch(
        `https://TUAPI.com/dl/spotify?url=${encodeURIComponent(url)}&key=TU_KEY_AQUI`
      )

      const resultAudio = await resAudio.json()

      const audioUrl =
        resultAudio?.data?.mp3 ||
        resultAudio?.result?.download ||
        resultAudio?.download ||
        resultAudio?.url

      if (!audioUrl) {
        return m.reply('❖ No se pudo descargar el audio de Spotify.')
      }

      const audioRes = await fetch(audioUrl)

      if (!audioRes.ok) {
        return m.reply('❖ Error al obtener el archivo de audio.')
      }

      const audioBuffer = Buffer.from(
        await audioRes.arrayBuffer()
      )

      const mensaje = {
        audio: audioBuffer,
        mimetype: 'audio/mpeg',
        fileName: `${songInfo.title || songInfo.name || 'spotify'}.mp3`
      }

      await sock.sendMessage(
        m.chat,
        mensaje,
        { quoted: m }
      )

    } catch (e) {
      await m.reply(msgglobal)
    }
  }
}
