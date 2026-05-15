import fetch from 'node-fetch'
import FormData from 'form-data'

// OWNER MANUAL
const OWNER_NUMBER = '559296077349'

export default {
  command: ['animarfoto', 'aianime', 'animate'],
  category: 'premium',

  run: async (client, m, args) => {
    try {
      // VALIDAR OWNER
      const senderNumber = m.sender.split('@')[0]
      const isOwner = senderNumber === OWNER_NUMBER

      // VALIDAR PREMIUM
      const user = global.db.data.users[m.sender]

      if (!user?.premium && !isOwner) {
        return m.reply(`╭─〔 ✦ Premium Exclusivo ✦ 〕─⬣
│
│ ✧ Esta función utiliza IA
│ ✧ avanzada para animar fotos.
│
│ ❀ Disponible únicamente
│ ❀ para usuarios Premium.
│
│ 🩷 Próximamente abriremos
│ 🩷 Patreon oficial con:
│
│ ┊➤ IA ilimitada
│ ┊➤ Mejor calidad HD
│ ┊➤ Funciones exclusivas
│ ┊➤ Acceso anticipado
│
╰────────────────⬣`)
      }

      // VALIDAR IMAGEN (Detección mejorada para evitar bucles)
      const q = m.quoted ? m.quoted : m
      const mime = (q.msg || q).mimetype || q.mediaType || ''

      if (!/image/.test(mime)) {
        return m.reply('《✧》 Responde a una imagen para animarla.')
      }

      await m.reply('𐙚 ❀ ｡ La IA está animando la imagen, espera un momento...')

      // DESCARGAR IMAGEN
      const media = await q.download()

      // SUBIR A CATBOX (Versión corregida con Headers y Formato)
      const form = new FormData()
      form.append('reqtype', 'fileupload')
      form.append('fileToUpload', media, {
        filename: 'image.jpg',
        contentType: 'image/jpeg'
      })

      const upload = await fetch('https://catbox.moe/user/api.php', {
        method: 'POST',
        body: form,
        headers: {
          ...form.getHeaders(),
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
        }
      })

      let imageUrl = await upload.text()
      imageUrl = imageUrl.trim()

      if (!imageUrl.startsWith('https://')) {
        console.error('Error Catbox:', imageUrl)
        return m.reply(`《✧》 Error al subir la imagen.\nDetalle: ${imageUrl.slice(0, 50)}`)
      }

      // API IA (Nekorinn)
      const apiUrl = `https://api.nekorinn.my.id/ai/img2video?url=${encodeURIComponent(imageUrl)}`

      const res = await fetch(apiUrl)
      const json = await res.json()

      const videoUrl = json?.result?.video || json?.result?.url || json?.url

      if (!videoUrl) {
        return m.reply('《✧》 La IA no pudo procesar esta imagen en particular.')
      }

      // ENVIAR VIDEO
      await client.sendMessage(
        m.chat,
        {
          video: { url: videoUrl },
          caption: `✦ Imagen animada correctamente con IA 🩷\n\n> ✿ Función exclusiva Premium`
        },
        { quoted: m }
      )

    } catch (e) {
      console.error(e)
      await m.reply(`《✧》 Error crítico al ejecutar el comando.\n${e.message}`)
    }
  }
}
