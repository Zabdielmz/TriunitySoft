export interface SubmissionNotification {
  name: string
  email: string
  category: string
  message: string
  createdAt: Date
}

const categoryLabels: Record<string, string> = { software: 'Software a medida', web: 'Desarrollo web', videojuego: 'Videojuego', otro: 'Otro proyecto' }

function escapeHtml(value: string): string {
  return value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#39;')
}
function notificationDate(value: Date): string {
  return value.toLocaleString('es-MX', { dateStyle: 'long', timeStyle: 'short', timeZone: 'America/Mexico_City' })
}

export function buildNotificationText(payload: SubmissionNotification): string {
  return [
    'TRIUNITY',
    'Recibimos un nuevo mensaje.',
    '',
    `Nombre: ${payload.name}`,
    `Correo: ${payload.email}`,
    `Tipo de proyecto: ${categoryLabels[payload.category] ?? payload.category}`,
    `Recibido: ${notificationDate(payload.createdAt)} (Ciudad de México)`,
    '',
    'Mensaje:',
    payload.message,
    '',
    `Responder: ${payload.email}`,
    'También puedes revisar esta solicitud en la bandeja del panel de administración.',
  ].join('\n')
}

export function buildNotificationHtml(payload: SubmissionNotification): string {
  const name = escapeHtml(payload.name)
  const email = escapeHtml(payload.email)
  const category = escapeHtml(categoryLabels[payload.category] ?? payload.category)
  const date = escapeHtml(notificationDate(payload.createdAt))
  const message = escapeHtml(payload.message).replace(/\r\n|\r|\n/g, '<br />')
  const replyUrl = escapeHtml(`mailto:${encodeURIComponent(payload.email)}?subject=${encodeURIComponent(`Re: tu solicitud — ${payload.name}`)}`)
  const preheader = escapeHtml(`${payload.name} · ${categoryLabels[payload.category] ?? payload.category}: ${payload.message}`.replace(/\s+/g, ' ').slice(0, 150))

  return `<!doctype html>
<html lang="es" xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="color-scheme" content="light dark" />
  <meta name="supported-color-schemes" content="light dark" />
  <title>Nueva solicitud de contacto · Triunity</title>
  <style>
    a { text-underline-offset: 3px; }
    @media only screen and (max-width: 620px) {
      .email-outer { padding: 16px 10px !important; }
      .email-content { padding: 28px 22px !important; }
      .email-header { padding: 25px 22px !important; }
      .email-title { font-size: 28px !important; }
      .email-meta-label, .email-meta-value { display: block !important; width: auto !important; }
      .email-meta-label { padding: 14px 0 3px !important; }
      .email-meta-value { padding: 0 0 8px !important; }
      .email-action { display: block !important; text-align: center !important; }
    }
    @media (prefers-color-scheme: dark) {
      .email-page, .email-outer { background-color: #080e16 !important; }
      .email-card, .email-content { background-color: #121c29 !important; }
      .email-title, .email-strong, .email-meta-value { color: #eef2fa !important; }
      .email-muted, .email-meta-label { color: #b0bfd1 !important; }
      .email-message { background-color: #1c2939 !important; color: #e1eaf5 !important; }
      .email-contact { color: #8ee8ff !important; }
      .email-divider { border-color: #35465a !important; }
      .email-action { background-color: #71e6ff !important; color: #102732 !important; border-color: #71e6ff !important; }
    }
  </style>
</head>
<body class="email-page" style="margin:0;padding:0;width:100%;background-color:#eef2f6;font-family:Arial,Helvetica,sans-serif;-webkit-text-size-adjust:100%">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;mso-hide:all">${preheader}</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse">
    <tr><td class="email-outer" align="center" bgcolor="#eef2f6" style="padding:40px 20px">
      <!--[if mso]><table role="presentation" width="600" cellpadding="0" cellspacing="0"><tr><td><![endif]-->
      <table class="email-card" role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#ffffff" style="width:100%;max-width:600px;border-collapse:separate;border-spacing:0;border-radius:14px;overflow:hidden">
        <tr><td class="email-header" bgcolor="#101923" style="padding:30px 36px;border-radius:14px 14px 0 0;border-bottom:3px solid #71e6ff">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
            <td style="color:#f1f5fc;font-size:21px;font-weight:700;letter-spacing:4px">TRIUNITY<span style="color:#71e6ff">.</span></td>
            <td align="right" style="color:#b5c8d9;font-size:12px;line-height:1.5">Contacto<br />del sitio web</td>
          </tr></table>
        </td></tr>
        <tr><td class="email-content" style="padding:36px">
          <h1 class="email-title" style="margin:0 0 16px;font-size:32px;line-height:1.18;letter-spacing:-.8px;font-weight:700;color:#142132">Recibimos un<br />nuevo mensaje.</h1>
          <p class="email-muted" style="margin:0 0 28px;font-size:16px;line-height:1.7;color:#526277"><strong class="email-strong" style="color:#213347">${name}</strong> se puso en contacto con Triunity. Aquí tienes los detalles de su solicitud.</p>
          <table class="email-divider" role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;border-top:1px solid #dfe5ed;border-bottom:1px solid #dfe5ed">
            <tr><td class="email-meta-label" valign="top" width="110" style="padding:20px 12px 8px 0;color:#5c6d81;font-size:14px;line-height:1.6">Proyecto</td><td class="email-meta-value" valign="top" style="padding:20px 0 8px;color:#213347;font-size:15px;line-height:1.6;font-weight:600;word-break:break-word">${category}</td></tr>
            <tr><td class="email-meta-label" valign="top" style="padding:8px 12px 8px 0;color:#5c6d81;font-size:14px;line-height:1.6">Correo</td><td class="email-meta-value" valign="top" style="padding:8px 0;color:#213347;font-size:15px;line-height:1.6;word-break:break-word"><a class="email-contact" href="${replyUrl}" style="color:#126078;text-decoration:underline;word-break:break-all">${email}</a></td></tr>
            <tr><td class="email-meta-label" valign="top" style="padding:8px 12px 20px 0;color:#5c6d81;font-size:14px;line-height:1.6">Recibido</td><td class="email-meta-value" valign="top" style="padding:8px 0 20px;color:#213347;font-size:14px;line-height:1.7">${date}<br /><span class="email-muted" style="font-size:12px;color:#627186">Hora de Ciudad de México</span></td></tr>
          </table>
          <h2 class="email-strong" style="margin:28px 0 12px;font-size:16px;line-height:1.5;color:#213347">Mensaje</h2>
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td class="email-message" bgcolor="#f2f5f8" style="padding:22px;border-radius:8px;font-size:16px;line-height:1.85;color:#34465b;word-break:break-word;overflow-wrap:anywhere">${message}</td></tr></table>
          <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%"><tr><td style="padding-top:28px">
            <a class="email-action" href="${replyUrl}" style="display:inline-block;background-color:#153242;color:#f0fbff;border:1px solid #153242;border-radius:6px;padding:15px 24px;font-size:15px;line-height:1.4;font-weight:700;text-decoration:none;mso-padding-alt:0;text-align:center"><!--[if mso]><i style="mso-font-width:120%;mso-text-raise:20pt" hidden>&emsp;</i><![endif]--><span style="mso-text-raise:10pt">Responder por correo</span><!--[if mso]><i style="mso-font-width:120%" hidden>&emsp;</i><![endif]--></a>
          </td></tr></table>
          <p class="email-muted" style="margin:14px 0 0;font-size:13px;line-height:1.7;color:#647489">También puedes revisar esta solicitud en la bandeja del panel de administración.</p>
        </td></tr>
      </table>
      <!--[if mso]></td></tr></table><![endif]-->
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:600px"><tr><td align="center" style="padding:24px 16px 4px">
        <p class="email-muted" style="margin:0;font-size:13px;line-height:1.8;color:#5c6d81">Triunity Software<br />Jugamos en serio. Creamos con pasión.</p>
        <p class="email-muted" style="margin:12px 0 0;font-size:12px;line-height:1.7;color:#65768a">Recibes este aviso porque tu correo está configurado<br />en las notificaciones del equipo.</p>
      </td></tr></table>
    </td></tr>
  </table>
</body>
</html>`
}
