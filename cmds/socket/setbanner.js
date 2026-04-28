import fetch from 'node-fetch';

const GITHUB_TOKEN = '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' // ⚠️ NO LO COMPARTAS

export default {
  command: ['setbanner', 'setbotbanner'],
  category: 'socket',
  run: async (client, m, args) => {
    const idBot = client.user.id.split(':')[0] + '@s.whatsapp.net'
    const config = global.db.data.settings[idBot]
    const isOwner2 = [idBot, ...(config.owner ? [config.owner] : []), ...global.owner.map(num => num + '@s.whatsapp.net')].includes(m.sender)
    if (!isOwner2) return m.reply(mess.socket)
    const value = args.join(' ').trim()
    if (!value && !m.quoted && !m.message.imageMessage && !m.message.videoMessage)
  return m.reply('✎ Debes enviar o citar una imagen o video para cambiar el banner del bot.')
    if (value.startsWith('http')) {
      config.banner = value
      return m.reply(`✿ Se ha actualizado el banner de *${config.namebot}*!`)
    }
    const q = m.quoted ? m.quoted : m.message.imageMessage ? m : m
    const mime = (q.msg || q).mimetype || q.mediaType || ''
    if (!/image\/(png|jpe?g|gif)|video\/mp4/.test(mime))
      return m.reply('✎ Responde a una imagen válida.')
    const buffer = await q.download()
    if (!buffer) return m.reply('✎ No se pudo descargar la imagen.')
    const url = await uploadImage(buffer, mime)
    if (!url) return m.reply('❌ Error al subir la imagen.')
    config.banner = url
    return m.reply(`✿ Se ha actualizado el banner de *${config.namebot}*!`)
  },
};

async function uploadImage(buffer, mime) {
  try {
    const repo = 'natie1515/Nekoupload'
    const ext = mime.split('/')[1]
    const fileName = `uploads/${Date.now()}.${ext}`

    const res = await fetch(`https://api.github.com/repos/${repo}/contents/${fileName}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${GITHUB_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: 'upload file',
        content: buffer.toString('base64')
      })
    })

    const json = await res.json()

    return json.content?.download_url
  } catch (e) {
    console.error(e)
    return null
  }
}
