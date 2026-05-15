export default {
  name: 'antistatus',

  async before(m, { client }) {
    try {

      // SOLO GRUPOS
      if (!m.isGroup) return false

      // ACTIVADO?
      if (!global.db?.chats?.[m.chat]?.antiStatus) {
        return false
      }

      // METADATA
      const metadata = await client.groupMetadata(m.chat)

      const participants = metadata.participants || []

      // ES ADMIN?
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

      // DETECTAR ESTADO COMPARTIDO
      const msg = m.message || {}

      const esEstado =
        msg?.groupStatusMentionMessage ||
        msg?.statusMentionMessage ||
        msg?.groupMentionedMessage ||
        msg?.extendedTextMessage?.contextInfo?.quotedStatus ||
        msg?.extendedTextMessage?.contextInfo?.remoteJid === 'status@broadcast'

      if (!esEstado) return false

      // ELIMINAR
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

❖ @${m.sender.split('@')[0]} solo los administradores pueden compartir estados en este grupo.`,
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
