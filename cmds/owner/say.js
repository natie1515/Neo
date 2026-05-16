export default {
  command: ['say'],
  category: 'owner',

  run: async (client, m, args) => {
    try {

      if (!args[0]) {
        return m.reply(
          '✎ Uso correcto:\n#say número mensaje\n\nEjemplo:\n#say 51999999999 Hola'
        )
      }

      // LIMPIAR NÚMERO
      const numero = args[0].replace(/[^0-9]/g, '')

      if (!numero) {
        return m.reply(
          '❖ Debes escribir un número válido.'
        )
      }

      const texto = args.slice(1).join(' ')

      if (!texto) {
        return m.reply(
          '❖ Debes escribir el mensaje.'
        )
      }

      // VERIFICAR SI EXISTE EN WHATSAPP
      const check = await client.onWhatsApp(numero)

      if (!check || !check[0]?.exists) {
        return m.reply(
          '❖ Ese número no existe en WhatsApp.'
        )
      }

      const jid = check[0].jid

      // ENVIAR MENSAJE AL PRIVADO
      await client.sendMessage(
        jid,
        {
          text: texto
        }
      )

      // ELIMINAR EL COMANDO DEL CHAT
      try {
        await m.delete()
      } catch {}

      // CONFIRMACIÓN SOLO PARA TI
      await client.sendMessage(
        m.chat,
        {
          text: `❀ Mensaje enviado correctamente.\n> ✦ Destino › ${numero}`
        },
        {
          quoted: m
        }
      )

    } catch (e) {

      console.log(e)

      await m.reply(
        `《✧》 Error al ejecutar el comando.\n${e.message}`
      )
    }
  }
}
