import { exec } from 'child_process';
import { promises as fs } from 'fs';

export default {
  command: ['tovideo', 'tomp4'],
  category: 'tools',
  run: async (client, m, args, usedPrefix, command, text) => {
    // 1. Verificar si se está citando un mensaje
    if (!m.quoted) return client.reply(m.chat, `《✧》 Debes citar un sticker animado para convertir a video.`, m);
    
    await m.react('🕒');
    
    // 2. Descargar el sticker (buffer)
    let xx = m.quoted;
    let buffer = await xx.download();
    
    if (!buffer) {
      await m.react('✖️');
      return client.reply(m.chat, `《✧》 No se pudo descargar el sticker.`, m);
    }

    // Nombres de archivos temporales únicos basados en la fecha actual
    const webpPath = `./tmp_${Date.now()}.webp`;
    const mp4Path = `./tmp_${Date.now()}.mp4`;

    try {
      // 3. Guardar el sticker animado temporalmente
      await fs.writeFile(webpPath, buffer);

      // 4. Convertir de WebP a MP4 usando FFmpeg
      exec(`ffmpeg -i ${webpPath} -vcodec libx264 -pix_fmt yuv420p ${mp4Path}`, async (err) => {
        
        // Si hay un error en la conversión (ej. no está instalado ffmpeg o el sticker es estático)
        if (err) {
          await m.react('✖️');
          await fs.unlink(webpPath).catch(() => {}); // Borrar el archivo temporal
          return client.reply(m.chat, `《✧》 Error al convertir. Asegúrate de que sea un sticker animado y que el bot tenga FFmpeg instalado.`, m);
        }
        
        // 5. Leer el video resultante y enviarlo
        let vidBuffer = await fs.readFile(mp4Path);
        await client.sendMessage(m.chat, { video: vidBuffer, caption: 'ꕥ *Aquí tienes tu video ฅ^•ﻌ•^ฅ*' }, { quoted: m });
        await m.react('✔️');

        // 6. Limpiar (borrar) los archivos temporales de tu servidor
        await fs.unlink(webpPath).catch(() => {});
        await fs.unlink(mp4Path).catch(() => {});
      });

    } catch (e) {
      await m.react('✖️');
      client.reply(m.chat, `《✧》 Ocurrió un error inesperado.`, m);
      
      // Limpieza por seguridad si ocurre un error en el try
      await fs.unlink(webpPath).catch(() => {});
      await fs.unlink(mp4Path).catch(() => {});
    }
  }
}
