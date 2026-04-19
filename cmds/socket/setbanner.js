import fetch from 'node-fetch'
import FormData from 'form-data'

export default {
command: ['setbanner','setbotbanner'],
category: 'socket',

run: async (client,m,args) => {

const idBot = client.user.id.split(':')[0] + '@s.whatsapp.net'
const config = global.db.data.settings[idBot]

const isOwner2 = [
idBot,
...(config.owner ? [config.owner] : []),
...global.owner.map(num=>num+'@s.whatsapp.net')
].includes(m.sender)

if (!isOwner2) return m.reply(mess.socket)

const value = args.join(' ').trim()

if (!value && !m.quoted && !m.message.imageMessage)
return m.reply('✎ Responde a una imagen.')

if (value.startsWith('http')) {
config.banner = value
return m.reply('✿ Banner actualizado.')
}

const q = m.quoted || m

const mime =
(q.msg || q).mimetype ||
q.mediaType || ''

const buffer = await q.download()

if (!buffer)
return m.reply('✕ No se pudo descargar.')

const url = await uploadImage(buffer,mime)

if (!url)
return m.reply('✕ Evogb rechazó la subida.')

config.banner = url

m.reply(
`✿ Banner actualizado!\n\n${url}`
)

}
}


async function uploadImage(buffer,mime){

try{

const form = new FormData()

form.append(
'files[]',
buffer,
{
filename:'banner.'+mime.split('/')[1]
}
)

const res = await fetch(
'https://evogb.win/api/upload',
{
method:'POST',
body:form,
headers:form.getHeaders()
}
)

// LEER COMO TEXTO, NO COMO JSON
const text = await res.text()

console.log(text)

// Si devolvió HTML, falló
if (text.startsWith('<!DOCTYPE'))
return null

// Intentar parsear manualmente
const json = JSON.parse(text)

if (!json.success)
return null

return json.result?.url || null

}catch(e){

console.error(e)

return null

}
}
