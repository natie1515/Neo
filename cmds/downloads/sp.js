import fetch from 'node-fetch'

export default {
  command: ['sp', 'spotify'],
  category: 'downloader',

  run: async (client, m, args, usedPrefix, command) => {
    try {
      if (!args[0]) {
        return m.reply(
          '✎ Por favor, menciona el nombre o URL de la canción que deseas descargar de Spotify'
        )
      }

      const text = args.join(' ')

      let url
      let songInfo

      // DETECTAR LINK DE SPOTIFY
      if (/open\.spotify\.com\/track\//i.test(text)) {

        url = text

        const resInfo = await fetch(
          `https://api.stellarwa.xyz/dl/spotify?url=${encodeURIComponent(url)}&key=nekotina`
        )

        const resultInfo = await resInfo.json()

        if (!resultInfo.status) {
          return m.reply('❖ No se pudo procesar el enlace de Spotify.')
        }

        songInfo = resultInfo.data

      } else {

        // BUSCADOR
        const search = await fetch(
          `https://TUAPI.com/search/spotify?query=${encodeURIComponent(text)}&key=TU_KEY_AQUI`
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

      const imageUrl = songInfo.image || songInfo.cover

      await client.sendMessage(
        m.chat,
        {
          image: { url: imageUrl },
          caption
        },
        { quoted: m }
      )

      // DESCARGAR AUDIO
      const resAudio = await fetch(
        `https://api.stellarwa.xyz/dl/spotify?url=${encodeURIComponent(url)}&key=nekotina`
      )

      const resultAudio = await resAudio.json()

      const audioUrl =
        resultAudio?.data?.mp3 ||
        resultAudio?.result?.download ||
        resultAudio?.download ||
        resultAudio?.url

      if (!audioUrl) {
        return m.reply(
          '❖ No se pudo descargar el audio de Spotify.'
        )
      }

      const audioBuffer = Buffer.from(
        await (await fetch(audioUrl)).arrayBuffer()
      )

      await client.sendMessage(
        m.chat,
        {
          audio: audioBuffer,
          mimetype: 'audio/mpeg',
          fileName: `${songInfo.title || songInfo.name || 'spotify'}.mp3`
        },
        { quoted: m }
      )

    } catch (e) {
      await m.reply(
        `《✧》 Error al ejecutar el comando.\n${e.message}`
      )
    }
  }
}
