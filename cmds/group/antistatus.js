export default {
  command: ['antistatus'],
  category: 'group',

  run: async (client, m, args) => {
    try {

      if (!m.isGroup) {
        return m.reply(
          '❖ Este comando solo funciona en grupos.'
        )
      }

      const option = (args[0] || '').toLowerCase()

      if (!['on', 'off'].includes(option)) {
        return m.reply(
          '✎ Uso correcto:\n#antistatus on\n#antistatus off'
        )
      }

      if (!global.db) global.db = {}
      if (!global.db.chats) global.db.chats = {}
      if (!global.db.chats[m.chat]) {
        global.db.chats[m.chat] = {}
      }

      global.db.chats[m.chat].antiStatus =
        option === 'on'

      await m.reply(
        option === 'on'
          ? '🛡️ Anti estados activado.'
          : '❖ Anti estados desactivado.'
      )

    } catch (e) {
      console.log(e)

      await m.reply(
        `《✧》 Error al ejecutar el comando.\n${e.message}`
      )
    }
  }
}
