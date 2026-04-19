import GraphemeSplitter from 'grapheme-splitter'

export default {
  command: ['setprefix', 'setbotprefix'],
  category: 'socket',
  run: async (client, m, args, usedPrefix, command) => {
    // Obtenemos el ID único de este bot
    const idBot = client.user.id.split(':')[0] + '@s.whatsapp.net'
    const config = global.db.data.settings[idBot]
    
    const isOwner2 = [idBot, ...(config.owner ? [config.owner] : []), ...global.owner.map(num => num + '@s.whatsapp.net')].includes(m.sender)
    if (!isOwner2) return client.reply(m.chat, mess.socket, m)
    
    const value = args.join(' ').trim()
    const defaultPrefix = ["#", "/", "!", "."]

    if (!value) {
      const lista = config.prefix === null ? '`sin prefijos`' : (Array.isArray(config.prefix) ? config.prefix : [config.prefix || '/']).map(p => `\`${p}\``).join(', ')
      return m.reply(`❀ Por favor, elige un prefijo válido.\n\nꕥ Actualmente en este bot: ${lista}`)
    }

    if (value.toLowerCase() === 'reset') {
      config.prefix = defaultPrefix
      return client.reply(m.chat, `❀ Prefijos restaurados para este bot.`, m)
    }

    if (value.toLowerCase() === 'noprefix') {
      config.prefix = true 
      return m.reply(`❀ Modo sin prefijos activado.`)
    }

    // Separamos por espacios para que "neko" sea una sola palabra
    let lista = value.split(/\s+/).filter(p => p.length > 0)

    // Lógica especial: si alguien intenta poner 'neko' pero no es en este bot específico, podrías filtrarlo.
    // Pero como el comando ya usa 'config' que depende de 'idBot', los cambios solo afectan a ESTA instancia.
    
    if (lista.length === 0) return client.reply(m.chat, 'ꕥ No se detectaron prefijos válidos.', m)
    
    // Guardamos la lista de prefijos SOLO en la configuración de este ID de bot
    config.prefix = lista
    
    return client.reply(m.chat, `❀ Prefijo configurado para este bot: *${lista.join(' , ')}*`, m)
  },
}
