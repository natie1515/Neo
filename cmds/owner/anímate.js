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

      // VALIDAR IMAGEN
      const q = m.quoted ? m.quoted : m
      const mime = (q.msg || q).mimetype || q.mediaType || ''

      if (!/image/.test(mime)) {
        return m.reply(
          '《✧》 Responde a una imagen para animarla.'
        )
      }

      await m.reply(
        '𐙚 ❀ ｡ La IA está animando la imagen, espera un momento...'
      )

      // DESCARGAR IMAGEN
      const buffer = await q.download()

      if (!buffer) {
        return m.reply(
          '《✧》 No se pudo descargar la imagen.'
        )
      }

      // SUBIR IMAGEN A UGUU
      const imageUrl = await uploadImage(buffer, mime)

      if (!imageUrl) {
        return m.reply(
          '《✧》 Error al subir la imagen.'
        )
      }

      // API IA
      const apiUrl =
        `https://api.nekorinn.my.id/ai/img2video?url=${encodeURIComponent(imageUrl)}`

      const res = await fetch(apiUrl)
      const json = await res.json()

      const videoUrl =
        json?.result?.video ||
        json?.result?.url ||
        json?.url

      if (!videoUrl) {
        console.log(json)

        return m.reply(
          '《✧》 La IA no pudo procesar esta imagen.'
        )
      }

      // ENVIAR VIDEO
      await client.sendMessage(
        m.chat,
        {
          video: { url: videoUrl },
          caption:
`✦ Imagen animada correctamente con IA 🩷

> ✿ Función exclusiva Premium`
        },
        { quoted: m }
      )

    } catch (e) {

      console.error(e)

      await m.reply(
        `《✧》 Error crítico al ejecutar el comando.\n${e.message}`
      )
    }
  }
}

// SUBIDA UGUU
async function uploadImage(buffer, mime) {

  const body = new FormData()

  body.append(
    'files[]',
    buffer,
    `file.${mime.split('/')[1] || 'jpg'}`
  )

  const res = await fetch(
    'https://uguu.se/upload.php',
    {
      method: 'POST',
      body,
      headers: body.getHeaders()
    }
  )

  const json = await res.json()

  return json.files?.[0]?.url
}
