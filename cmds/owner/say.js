export default {
  command: ['say'],
  category: 'owner',

  run: async (client, m, args) => {
    try {
      if (!args[0]) {
        return m.reply(
          '✎ Uso correcto:\n#say numero mensaje\n\nEjemplo:\n#say 51999999999 Hola'
        )
      }

      const numero = args[0].replace(/[^0-9]/g, '')

      if (!numero) {
        return m.reply('❖ Debes escribir un número válido.')
      }

      const texto = args.slice(1).join(' ')

      if (!texto) {
        return m.reply('❖ Debes escribir el mensaje que deseas enviar.')
      }

      const jid = numero + '@s.whatsapp.net'

      await client.sendMessage(
        jid,
        {
          text: texto
        }
      )

      await m.reply(
        `❀ Mensaje enviado correctamente al número:\n${numero}`
      )

    } catch (e) {
      await m.reply(
        `《✧》 Error al ejecutar el comando.\n${e.message}`
      )
    }
  }
}
