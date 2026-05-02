export default {
  command: ['postular', 'applyadmin'],
  category: 'info',
  run: async (client, m, args, usedPrefix, command, text) => {
    const texto = text.trim()
    const now = Date.now()
    const cooldown = global.db.data.users[m.sender].postCooldown || 0
    const restante = cooldown - now

    if (restante > 0) {
      return m.reply(`ꕥ Espera *${msToTime(restante)}* para volver a postularte.`)
    }

    if (!texto) {
      return m.reply(`《✧》 Debes *llenar la plantilla completa* usando:\n\n.postular [respuestas]`)
    }

    if (texto.length < 100) {
      return m.reply('《✧》 Tu postulación es *demasiado corta*. Responde TODO con detalle.')
    }

    const fecha = new Date()
    const fechaLocal = fecha.toLocaleDateString('es-MX', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })

    const user = m.pushName || 'Usuario desconocido'
    const numero = m.sender.split('@')[0]

    const pp = await client.profilePictureUrl(m.sender, 'image')
      .catch(() => 'https://cdn.yuki-wabot.my.id/files/2PVh.jpeg')

    let postMsg = `📝 *POSTULACIÓN A ADMIN* 📝\n\n` +
    `❖ *Nombre*\n> ${user}\n\n` +
    `❖ *Número*\n> wa.me/${numero}\n\n` +
    `❖ *Fecha*\n> ${fechaLocal}\n\n` +
    `❖ *Respuestas*\n> ${texto}\n\n`

    const destinos = [
      '522217634546@s.whatsapp.net', // +52 221 763 4546
      '559296077349@s.whatsapp.net' // +55 92 9607-7349
    ]

    for (const jid of destinos) {
      try {
        await client.sendContextInfoIndex(
          jid,
          postMsg,
          {},
          null,
          false,
          null,
          {
            banner: pp,
            title: '📩 Nueva Postulación',
            body: '✧ Revisar solicitud de admin',
            redes: global.db.data.settings[client.user.id.split(':')[0] + "@s.whatsapp.net"].link
          }
        )
      } catch (e) {
        console.error(e)
      }
    }

    global.db.data.users[m.sender].postCooldown = now + 24 * 60 * 60 * 1000

    m.reply(`《✧》 Tu *postulación* fue enviada correctamente.\n\n✔️ Será revisada por el staff\n⚠️ No garantiza aceptación`)
  },
}

const msToTime = (duration) => {
  const seconds = Math.floor((duration / 1000) % 60)
  const minutes = Math.floor((duration / (1000 * 60)) % 60)
  const hours = Math.floor((duration / (1000 * 60 * 60)) % 24)
  const days = Math.floor(duration / (1000 * 60 * 60 * 24))

  const s = seconds.toString().padStart(2, '0')
  const m = minutes.toString().padStart(2, '0')
  const h = hours.toString().padStart(2, '0')
  const d = days.toString()

  const parts = []
  if (days > 0) parts.push(`${d} día${d > 1 ? 's' : ''}`)
  if (hours > 0) parts.push(`${h} hora${h > 1 ? 's' : ''}`)
  if (minutes > 0) parts.push(`${m} minuto${m > 1 ? 's' : ''}`)
  parts.push(`${s} segundo${s > 1 ? 's' : ''}`)

  return parts.join(', ')
}
