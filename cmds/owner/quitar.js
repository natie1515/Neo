import { resolveLidToRealJid } from "../../core/utils.js"

export default {
  command: ['delcoin', 'resetcoin'],
  isOwner: true,
  run: async (client, m, args, usedPrefix, command) => {
    try {
      const mentioned = m.mentionedJid
      const who2 = mentioned.length > 0 
        ? mentioned[0] 
        : (m.quoted ? m.quoted.sender : null)

      const who = await resolveLidToRealJid(who2, client, m.chat)

      const bot = global.db.data.settings[
        client.user.id.split(':')[0] + '@s.whatsapp.net'
      ]

      const currency = bot.currency || '$'

      if (!who) {
        return client.reply(
          m.chat,
          '❀ Por favor, menciona al usuario o cita un mensaje.',
          m
        )
      }

      await m.react('🕒')

      if (!global.db.data.chats[m.chat]) {
        global.db.data.chats[m.chat] = { users: {} }
      }

      if (!global.db.data.chats[m.chat].users) {
        global.db.data.chats[m.chat].users = {}
      }

      const userData = global.db.data.chats[m.chat].users

      if (!userData[who]) {
        userData[who] = { coins: 0 }
      }

      // Eliminar todas las monedas
      userData[who].coins = 0

      await m.react('✔️')

      return client.reply(
        m.chat,
        `❀ *Monedas eliminadas*\n@${who.split('@')[0]} ahora tiene *0 ${currency}*`,
        m,
        { mentions: [who] }
      )

    } catch (error) {
      console.error(error)

      await m.react('✖️')

      return client.reply(
        m.chat,
        `⚠︎ Se ha producido un problema.\n${error.message}`,
        m
      )
    }
  }
}
