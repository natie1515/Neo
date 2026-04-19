import fetch from 'node-fetch';
import FormData from 'form-data';

export default {
  command: ['setbanner', 'setmenubanner'],
  category: 'socket',
  run: async (client, m, args) => {
    const idBot = client.user.id.split(':')[0] + '@s.whatsapp.net'
    const config = global.db.data.settings[idBot]
    const isOwner2 = [idBot, ...(config.owner ? [config.owner] : []), ...global.owner.map(num => num + '@s.whatsapp.net')].includes(m.sender)
    if (!isOwner2) return m.reply(mess.socket)
    const value = args.join(' ').trim()
    
    if (!value && !m.quoted && !m.message.imageMessage && !m.message.videoMessage)
      return m.reply('✎ Debes enviar o citar una imagen o video para cambiar el banner del bot.')

    // --- CONFIGURACIÓN DE API ---
    const token = 'evogb-IOp2Gu7J' // <--- PON TU TOKEN AQUÍ
    const endpoint = 'https://api.evogb.org/api/cdn/upload'
    // ----------------------------

    if (value.startsWith('http')) {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-upload-token': token },
        body: JSON.stringify({ url: value })
      })
      const data = await res.json()
      config.banner = data.result?.url || data.url || value
      return m.reply(`✿ Se ha actualizado el banner de *${config.namebot}*!`)
    }

    const q = m.quoted ? m.quoted : m.message.imageMessage ? m : m
    const mime = (q.msg || q).mimetype || q.mediaType || ''
    if (!/image\/(png|jpe?g|gif)|video\/mp4/.test(mime))
      return m.reply('✎ Responde a una imagen válida.')

    const buffer = await q.download()
    if (!buffer) return m.reply('✎ No se pudo descargar la imagen.')

    // Uso de la nueva función con la API de Evogb
    const url = await uploadImage(buffer, mime, token, endpoint)
    if (!url) return m.reply('✕ Error al subir a la API de Evogb.')

    config.banner = url
    return m.reply(`✿ Se ha actualizado el banner de *${config.namebot}*!`)
  },
};

async function uploadImage(buffer, mime, token, endpoint) {
  try {
    const body = new FormData()
    // Según la doc de Evogb, el campo suele ser 'file'
    body.append('file', buffer, { 
      filename: `file.${mime.split('/')[1]}`,
      contentType: mime 
    })

    const res = await fetch(endpoint, { 
      method: 'POST', 
      body, 
      headers: {
        ...body.getHeaders(),
        'x-upload-token': token 
      }
    })
    const json = await res.json()
    return json.result?.url || json.url
  } catch (e) {
    console.error(e)
    return null
  }
}
