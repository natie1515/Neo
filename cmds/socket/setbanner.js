import fetch from 'node-fetch';
import FormData from 'form-data';

export default {
  command: ['setbanner', 'setbotbanner'],
  category: 'socket',
  run: async (client, m, args) => {
    const idBot = client.user.id.split(':')[0] + '@s.whatsapp.net'
    const config = global.db.data.settings[idBot]
    
    // Verificación de Owner
    const isOwner2 = [idBot, ...(config.owner ? [config.owner] : []), ...global.owner.map(num => num + '@s.whatsapp.net')].includes(m.sender)
    if (!isOwner2) return m.reply(mess.socket)

    const value = args.join(' ').trim()
    let finalUrl = ''

    // 1. Si el usuario proporciona una URL directa
    if (value.startsWith('http')) {
      finalUrl = value
    } 
    // 2. Si el usuario envía o cita un archivo multimedia
    else if (m.quoted || m.message.imageMessage || m.message.videoMessage) {
      const q = m.quoted ? m.quoted : m.message.imageMessage ? m : m
      const mime = (q.msg || q).mimetype || q.mediaType || ''
      
      if (!/image\/(png|jpe?g|gif)|video\/mp4/.test(mime)) {
        return m.reply('✎ Por favor, usa una imagen (jpg, png, gif) o video mp4.')
      }

      const buffer = await q.download()
      if (!buffer) return m.reply('✕ Error al descargar el archivo.')
      
      // Subida temporal para obtener una URL que la API de evogb pueda leer
      finalUrl = await uploadToTemp(buffer, mime)
    } 
    else {
      return m.reply('✎ Debes enviar/citar una imagen o poner una URL.')
    }

    if (!finalUrl) return m.reply('✕ No se pudo obtener la URL del archivo.')

    // 3. Uso de tu API específica para establecer el banner
    try {
      const res = await fetch("https://evogb.win/api/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: finalUrl,
          author: "ConsoleUser" // Puedes cambiar esto por el nombre de tu bot
        })
      })

      const data = await res.json()

      if (data.result && data.result.url) {
        config.banner = data.result.url
        return m.reply(`✿ ¡Banner actualizado correctamente!\n\n*Resultado:* ${data.result.url}`)
      } else {
        return m.reply('✕ La API no devolvió una URL válida.')
      }
    } catch (err) {
      console.error(err)
      return m.reply('✕ Hubo un error al conectar con la API de subida.')
    }
  },
}

// Función auxiliar para convertir el buffer en URL temporal si es necesario
async function uploadToTemp(buffer, mime) {
  try {
    const body = new FormData()
    body.append('files[]', buffer, `file.${mime.split('/')[1]}`)
    const res = await fetch('https://uguu.se/upload.php', { method: 'POST', body, headers: body.getHeaders() })
    const json = await res.json()
    return json.files?.[0]?.url
  } catch {
    return null
  }
}
