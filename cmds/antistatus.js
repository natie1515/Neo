export default {
  name: 'antistatus',

  async before(m, { client }) {
    try {

      // SOLO GRUPOS
      if (!m.isGroup) return false

      // BASE DE DATOS
      if (!global.db?.chats?.[m.chat]?.antiStatus) return false

      // OBTENER METADATA
      const metadata = await client.groupMetadata(m.chat)

      const participants = metadata.participants || []

      // VERIFICAR ADMIN
      const isAdmin = participants.find(
        p =>
          p.id === m.sender &&
          (p.admin === 'admin' || p.admin === 'superadmin')
      )

      // IGNORAR ADMINS
      if (isAdmin) return false

      // IGNORAR OWNERS
      if (global.owner?.includes(m.sender.split('@')[0])) {
        return false
      }

      // TEXTO
      const text =
        m.text ||
        m.body ||
        m.message?.conversation ||
        m.message?.extendedTextMessage?.text ||
        ''

      // DETECTAR ESTADOS/CANALES
      const esEstado =
        text.includes('https://whatsapp.com/channel/') ||
        text.includes('status@broadcast')

      if (!esEstado) return false

      // BORRAR MENSAJE
      await client.sendMessage(
        m.chat,
        {
          delete: m.key
        }
      )

      // AVISO
      await client.sendMessage(
        m.chat,
        {
          text:
`🛡️ *ANTI ESTADOS ACTIVADO*

❖ @${m.sender.split('@')[0]} solo los administradores pueden compartir estados o canales en este grupo.`,
          mentions: [m.sender]
        }
      )

      return true

    } catch (e) {
      console.log(e)
      return false
    }
  }
}
