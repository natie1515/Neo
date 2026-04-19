import fetch from 'node-fetch';

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
    let urlParaSubir = ''

    // 1. Si el usuario pone una URL directa
    if (value.startsWith('http')) {
      urlParaSubir = value
    } 
    // 2. Si el usuario cita una imagen, primero necesitamos una URL temporal
    // (Porque tu API de evogb pide una URL, no un archivo directo)
    else if (m.quoted || m.message.imageMessage || m.message.videoMessage) {
      const q = m.quoted ? m.quoted : m.message.imageMessage ? m : m
      const buffer = await q.download()
      // Usamos un convertidor rápido de buffer a URL (puedes usar el que ya tengas en tu bot)
      urlParaSubir = await uploadToTelegraPh(buffer) 
    } else {
      return m.reply('✎ Debes proporcionar una URL o citar una imagen.')
    }

    if (!urlParaSubir) return m.reply('✕ No se pudo procesar la imagen.')

    // 3. LA PARTE QUE SOLICITASTE: Subir a evogb.win vía URL
    try {
      const res = await fetch("https://evogb.win/api/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: urlParaSubir,
          author: "ConsoleUser" 
        })
      })

      const data = await res.json()

      // Verificamos si la respuesta fue exitosa según el formato de tu API
      if (data.success && data.result?.url) {
        config.banner = data.result.url
        return m.reply(`✿ ¡Banner actualizado!\n\n${data.result.url}`)
      } else {
        // Si falla, mostramos el error que da la API (como el de tu captura)
        return m.reply(`✕ Error: ${data.message || 'No se pudo subir.'}`)
      }
    } catch (err) {
      console.error(err)
      return m.reply('✕ Error al conectar con la API.')
    }
  },
}

// Función auxiliar para obtener una URL si citan una imagen
async function uploadToTelegraPh(buffer) {
  try {
    const { fileTypeFromBuffer } = await import('file-type')
    const { ext } = await fileTypeFromBuffer(buffer)
    const body = new FormData()
    body.append('file', buffer, 'tmp.' + ext)
    const res = await fetch('https://telegra.ph/upload', { method: 'POST', body })
    const json = await res.json()
    return 'https://telegra.ph' + json[0].src
  } catch {
    return null
  }
}
