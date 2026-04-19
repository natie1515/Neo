import GraphemeSplitter from 'grapheme-splitter'

export default {
  command: ['setprefix', 'setbotprefix'],
  category: 'socket',
  run: async (client, m, args, usedPrefix, command) => {
    const idBot = client.user.id.split(':')[0] + '@s.whatsapp.net'
    const config = global.db.data.settings[idBot]
    const isOwner2 = [idBot, ...(config.owner ? [config.owner] : []), ...global.owner.map(num => num + '@s.whatsapp.net')].includes(m.sender)
    
    if (!isOwner2) return client.reply(m.chat, mess.socket, m)
    
    const value = args.join(' ').trim()
    const defaultPrefix = ["#", "/", "!", "."]

    if (!value) {
      const lista = config.prefix === null ? '`sin prefijos`' : (Array.isArray(config.prefix) ? config.prefix : [config.prefix || '/']).map(p => `\`${p}\``).join(', ')
      return m.reply(`❀ Por favor, elige cualquiera de los siguientes métodos de prefijos.\n\n> *○ Only-Prefix* » ${usedPrefix + command} *.*\n> *○ Multi-Prefix* » ${usedPrefix + command} *! . #*\n> *○ Word-Prefix* » ${usedPrefix + command} *neko*\n\nꕥ Actualmente se está usando: ${lista}`)
    }

    if (value.toLowerCase() === 'reset') {
      config.prefix = defaultPrefix
      return client.reply(m.chat, `❀ Se han restaurado los prefijos predeterminados.`, m)
    }

    if (value.toLowerCase() === 'noprefix') {
      config.prefix = true 
      return m.reply(`❀ Se cambió al modo sin prefijos.`)
    }

    // --- CAMBIO CLAVE AQUÍ ---
    // En lugar de separar cada letra, separamos por espacios para permitir palabras
    const lista = value.split(/\s+/).filter(p => p.length > 0)

    if (lista.length === 0) return client.reply(m.chat, 'ꕥ No se detectaron prefijos válidos.', m)
    if (lista.length > 10) return client.reply(m.chat, 'ꕥ Demasiados prefijos permitidos.', m)

    config.prefix = lista
    
    // El mensaje de confirmación mostrará los prefijos elegidos
    return client.reply(m.chat, `❀ Se cambió el prefijo del Socket a: *${lista.join(' , ')}* correctamente.`, m)
  },
}
