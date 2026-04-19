import fetch from 'node-fetch';
import FormData from 'form-data';

export default {
  command: ['setbanner', 'setbotbanner'],
  category: 'socket',
  run: async (client, m, args) => {
    const idBot = client.user.id.split(':')[0] + '@s.whatsapp.net';
    const config = global.db.data.settings[idBot];
    
    const isOwner2 = [idBot, ...(config.owner ? [config.owner] : []), ...global.owner.map(num => num + '@s.whatsapp.net')].includes(m.sender);
    if (!isOwner2) return m.reply(mess.socket);

    const value = args.join(' ').trim();
    
    try {
      let response;

      // Si es una URL directa
      if (value.startsWith('http')) {
        response = await fetch("https://evogb.win/api/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            url: value,
            author: "ConsoleUser"
          })
        });
      } 
      // Si es una imagen/video citado o enviado
      else if (m.quoted || m.message.imageMessage || m.message.videoMessage) {
        const q = m.quoted ? m.quoted : m.message.imageMessage ? m : m;
        const mime = (q.msg || q).mimetype || '';
        const buffer = await q.download();
        
        if (!buffer) return m.reply('✕ No se pudo procesar el archivo de WhatsApp.');

        const body = new FormData();
        // Enviamos el archivo físico directamente a tu API
        body.append('file', buffer, { 
          filename: `banner.${mime.split('/')[1]}`,
          contentType: mime 
        });
        body.append('author', 'ConsoleUser');

        response = await fetch("https://evogb.win/api/upload", {
          method: "POST",
          body: body,
          headers: body.getHeaders()
        });
      } else {
        return m.reply('✎ Proporciona una URL o responde a una imagen/video.');
      }

      const data = await response.json();

      if (data.success && data.result?.url) {
        config.banner = data.result.url;
        return m.reply(`✿ ¡Banner actualizado exitosamente!\n\n*Enlace:* ${data.result.url}`);
      } else {
        return m.reply(`✕ La API respondió: ${data.message || 'Error desconocido.'}`);
      }

    } catch (err) {
      console.error("Error en setbanner:", err);
      return m.reply('✕ Hubo un fallo al conectar con evogb.win.');
    }
  },
};
