import fetch from 'node-fetch';
import FormData from 'form-data';

export default {
  command: ['setbanner', 'setbotbanner'],
  category: 'socket',
  run: async (client, m, args) => {
    const idBot = client.user.id.split(':')[0] + '@s.whatsapp.net';
    const config = global.db.data.settings[idBot];
    
    const isOwner2 = [
      idBot, 
      ...(config.owner ? [config.owner] : []), 
      ...global.owner.map(num => num + '@s.whatsapp.net')
    ].includes(m.sender);

    if (!isOwner2) return m.reply(mess.socket);

    const value = args.join(' ').trim();

    // Caso 1: El usuario envía una URL directa
    if (value.startsWith('http')) {
      const cloudUrl = await uploadByUrl(value); // Subimos la URL a la API para persistencia
      if (!cloudUrl) return m.reply('✕ Error al procesar la URL de la imagen.');
      
      config.banner = cloudUrl;
      return m.reply(`✿ ¡Banner actualizado mediante URL en *${config.namebot}*!`);
    }

    // Caso 2: El usuario envía o cita un archivo (Imagen/Video)
    if (!m.quoted && !m.message.imageMessage && !m.message.videoMessage) {
      return m.reply('✎ Debes enviar/citar una imagen/video o proporcionar una URL.');
    }

    const q = m.quoted ? m.quoted : m.message.imageMessage ? m : m;
    const mime = (q.msg || q).mimetype || q.mediaType || '';

    if (!/image\/(png|jpe?g|gif)|video\/mp4/.test(mime)) {
      return m.reply('✎ Formato no compatible. Usa imágenes (jpg, png, gif) o video mp4.');
    }

    const buffer = await q.download();
    if (!buffer) return m.reply('✕ No se pudo procesar el archivo multimedia.');

    // Subida de archivo físico
    const url = await uploadImage(buffer, mime);
    if (!url) return m.reply('✕ Error al subir el archivo al servidor.');

    config.banner = url;
    return m.reply(`✿ ¡Se ha actualizado el banner de *${config.namebot}*!`);
  },
};

/**
 * Sube una imagen directamente desde una URL externa a la API de evogb
 */
async function uploadByUrl(imageUrl) {
  try {
    const res = await fetch("https://evogb.win/api/upload", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        url: imageUrl,
        author: "RaidBlocker-System" // Personalizado para tu proyecto
      })
    });
    const data = await res.json();
    return data.result?.url || null;
  } catch (e) {
    console.error("Error en uploadByUrl:", e);
    return null;
  }
}

/**
 * Sube un buffer de imagen/video a Uguu.se
 */
async function uploadImage(buffer, mime) {
  try {
    const body = new FormData();
    body.append('files[]', buffer, `file.${mime.split('/')[1]}`);
    const res = await fetch('https://uguu.se/upload.php', { 
      method: 'POST', 
      body, 
      headers: body.getHeaders() 
    });
    const json = await res.json();
    return json.files?.[0]?.url;
  } catch (e) {
    console.error("Error en uploadImage:", e);
    return null;
  }
}
