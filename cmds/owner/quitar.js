import { resolveLidToRealJid } from "../../core/utils.js"

export default {
  command: ['resetcoin'],
  isOwner: true,
  run: async (client, m, args, usedPrefix, command) => {
    try {
      const mentioned = m.mentionedJid
      const who2 = mentioned.length > 0 ? mentioned[0] : (m.quoted ? m.quoted.sender : null)
      const who = await resolveLidToRealJid(who2, client, m.chat)
      
      if (!who) return client.reply(m.chat, '❀ Por favor, menciona al usuario o cita un mensaje.', m)
      
      if (!global.db.data.chats[m.chat]) global.db.data.chats[m.chat] = { users: {} }
      if (!global.db.data.chats[m.chat].users) global.db.data.chats[m.chat].users = {}
      
      const userData = global.db.data.chats[m.chat].users
      
      // Reseteamos las monedas a 0
      userData[who] = { coins: 0 }
      
      await m.react('✔️')
      return client.reply(m.chat, `❀ *Eliminado:*\n» Se han reiniciado los Yenes a *0*\n@${who.split('@')[0]}, tus Yenes han sido eliminados.`, m, { mentions: [who] })
      
    } catch (error) {
      console.error(error)
      await m.react('✖️')
      return client.reply(m.chat, `⚠︎ Se ha producido un problema.\n${error.message}`, m)
    }
  }
}
