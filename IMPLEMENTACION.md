# Triunity — Implementación del formulario de contacto y panel de administración

> Documento generado tras la implementación completa del backend, el formulario real y el panel oculto.
> Incluye qué se construyó, cómo está organizado y recomendaciones de seguridad.

---

## 1. Qué se implementó

### Formulario de contacto real
- El formulario del sitio ya no es una demo: envía a `POST /api/contact`, guarda en **Neon (PostgreSQL)** y notifica por correo a los administradores vía **Resend**.
- Experiencia de usuario: botón con spinner animado mientras envía, mensaje de agradecimiento *«Gracias por enviar tu formulario. Nos pondremos en contacto contigo pronto.»*, y errores claros (incluido «Espera unos segundos antes de enviar otro mensaje» cuando hay rate limit).
- Se eliminó el flujo antiguo de borrador `mailto:` y el error de demostración.

### Backend (`backend/`)
- **Base de datos**: Drizzle ORM sobre `@neondatabase/serverless` (neon-http, conexión directa).
- **Cifrado en reposo**: nombre, email y mensaje se guardan cifrados con **AES-256-GCM** (IV aleatorio por registro).
- **Hashes consultables**: `email_hash` e `ip_hash` con **HMAC-SHA256** (misma clave para ambos) para poder aplicar cooldowns sin descifrar.
- **Notificaciones**: correo de resumen a todos los correos de la tabla `notify_emails` (máx. 10), con `await` antes de responder 200 (si falla el envío, se registra el error y la solicitud queda guardada).
- **Panel de administración** con login (**bcrypt** cost 12 + **JWT HS256** con `jose`), cookie `triunity_session` (`HttpOnly; Secure; SameSite=Strict`, caduca en 12 h).

### Panel oculto
- MPA separado servido en `/panel-b84cbb776bb32b95` (el nombre del archivo es el secreto de la ruta).
- Protecciones: `<meta name="robots" content="noindex">`, header `X-Robots-Tag`, `Cache-Control: no-store`, `frame-ancestors 'none'`.
- Funciones: ver solicitudes (leído/no leído), expandir mensaje, responder por correo, gestionar la lista de correos de notificación, cerrar sesión.

---

## 2. Estructura del proyecto

```
TriunitySoft/
├── api/                        # SOLO shims de 1 línea (Vercel exige las funciones aquí)
│   ├── contact.ts              #   export { default } from '../backend/src/contact'
│   ├── auth/{login,logout,session}.ts
│   └── admin/{submissions,notify}.ts
├── backend/                    # ← Todo el backend vive aquí
│   ├── drizzle.config.ts       # Config de Drizzle (rutas relativas a la RAÍZ, ver nota)
│   ├── drizzle/                # Migraciones SQL generadas (0000_*.sql + meta)
│   ├── scripts/
│   │   └── seed-admin.mjs      # Crea/actualiza el admin (pnpm seed:admin)
│   └── src/
│       ├── lib/                # config, db, schema, crypto, auth, email, http, validation
│       ├── contact.ts          # POST /api/contact
│       ├── auth/               # login, logout, session
│       └── admin/              # submissions, notify
├── panel-b84cbb776bb32b95.html # Entrada MPA del panel (nombre = secreto)
├── src/panel/                  # React del panel (Login, Dashboard, api client, estilos)
├── src/lib/contact.ts          # Cliente del formulario (fetch → /api/contact)
├── src/pages/HomePage.tsx      # Sección Contact con spinner y estados
├── .env                        # Secretos locales (en .gitignore; nunca se commitea)
├── vercel.json                 # cleanUrls, rewrite SPA, headers del panel
├── vite.config.ts              # Build MPA: index.html + panel-*.html
└── tsconfig.api.json           # Type-check de backend/ + api/
```

**Nota sobre `api/`:** Vercel solo despliega funciones serverless desde la carpeta `api/` en la raíz. Por eso ahí solo hay *shims* de una línea; moverlos a `backend/` rompería el despliegue. Toda la lógica —lo que sí se puede reorganizar— está en `backend/`.

**Nota sobre `drizzle.config.ts`:** drizzle-kit resuelve las rutas relativas (`schema`, `out`) desde el **directorio de trabajo (raíz)**, no desde la ubicación del archivo de config. Por eso dentro de `backend/drizzle.config.ts` las rutas empiezan con `./backend/...`.

---

## 3. Endpoints

| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| POST | `/api/contact` | Origin + guards | Recibe el formulario (ver §4) |
| POST | `/api/auth/login` | — | Login del panel (rate limit 5 intentos / 10 min por IP) |
| POST | `/api/auth/logout` | Cookie | Limpia la sesión |
| GET | `/api/auth/session` | Cookie | Devuelve `{ username }` o 401 |
| GET | `/api/admin/submissions` | Cookie | Lista las últimas 200 solicitudes (descifradas) |
| PATCH | `/api/admin/submissions` | Cookie + Origin | Marca leída / no leída |
| GET | `/api/admin/notify` | Cookie | Lista de correos de notificación |
| POST | /api/admin/notify | Cookie + Origin | Agrega correo (máx. 10) |
| DELETE | `/api/admin/notify?id=` | Cookie + Origin | Elimina correo (siempre queda ≥ 1) |

No existe `/api/auth/setup` ni `/api/auth/status` (attack surface mínimo); el usuario admin se crea/actualiza solo con `pnpm seed:admin`.

---

## 4. Defensas del endpoint de contacto (capas, en orden)

1. **Método y Origin**: solo POST; `Origin` debe coincidir con el `Host` (anti CSRF desde otros sitios).
2. **Tamaño**: `Content-Length` > 32 KB → 413.
3. **Validación Zod**: nombre (2–100), email válido (≤254), categoría enum, mensaje (10–2000), `startedAt`.
4. **Honeypot**: campo oculto `website` relleno → responde 200 falso sin guardar (el bot cree que funcionó).
5. **Time-trap**: si el formulario se envió en menos de 3 s (o hace más de 7 días) → 200 falso.
6. **Anti-spam**: máximo 3 URLs en el mensaje; si no, 200 falso.
7. **Cooldowns**: 60 s por email, 15 s por IP, máximo 5 por hora por IP → 429 con mensaje amigable.
8. **INSERT primero** (cifrado AES-256-GCM + HMACs) y **después** `await` de Resend; si Resend falla, se loguea y se responde 200 igual (la solicitud no se pierde).
9. **Límite de correos**: sin destinatarios en `notify_emails` → se guarda igual y se loguea (nunca se rompe el envío).

Además: la IP solo se guarda hasheada (HMAC), nunca en claro.

---

## 5. Configuración y comandos

### Variables de entorno (`.env` local + Vercel)

| Variable | Uso | ¿En Vercel? |
|---|---|---|
| `DATABASE_URL` | Conexión directa a Neon | Sí |
| `RESEND_API_KEY` | API key de Resend | Sí |
| `RESEND_FROM` | Remitente con dominio verificado | Sí |
| `PANEL_SESSION_SECRET` | Firma JWT (64 hex) | Sí |
| `CONTACT_ENCRYPTION_KEY` | Clave AES-256-GCM (64 hex) | Sí |
| `CONTACT_HMAC_SECRET` | HMAC de emails/IPs (64 hex) | Sí |
| `ADMIN_USER` / `ADMIN_PASS` | Solo para el seed local | No |

> Los tres secretos hexadecimales ya están generados en el `.env` local. En Vercel debes definir las 6 del runtime **con los mismos valores** (Settings → Environment Variables). Genera nuevos con:
> `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`

### Comandos

```bash
pnpm db:push        # Crea/actualiza tablas en Neon (desarrollo — usa esto primero)
pnpm db:generate    # Genera migración SQL en backend/drizzle/ (a partir de cambios de schema)
pnpm db:migrate     # Aplica las migraciones a la BD (producción con BD vacía)
pnpm seed:admin     # Crea o ACTUALIZA el admin (sirve para recuperar la contraseña)
pnpm lint / pnpm build
```

**Flujo de base de datos recomendado:**
- **Desarrollo**: `pnpm db:push` (diff directo, sin migraciones).
- **Producción (BD nueva)**: `pnpm db:migrate` — ya existe la migración base `0000_silent_mach_iv.sql`.
- Elige **uno** de los dos flujos por entorno; no mezcles `push` y `migrate` sobre la misma BD.

### Panel
- URL: `/panel-b84cbb776bb32b95` (sin extensión, gracias a `cleanUrls`).
- No hay ningún enlace hacia él desde el sitio.
- Local: se sirve con `pnpm dev` (el HTML), pero **las APIs requieren `vercel dev`** (Vite no sirve `/api`).

---

## 6. Recomendaciones de seguridad

### ✅ Ya implementado
- Cifrado en reposo de datos personales (AES-256-GCM) y hashes HMAC para consultas.
- Credenciales nunca en el bundle del navegador (todo pasa por serverless functions).
- Cookie de sesión `HttpOnly + Secure + SameSite=Strict`, JWT con `algorithms: ['HS256']` explícito (evita confusión de algoritmo).
- Origen validado en todos los POST/PATCH/DELETE; login con rate limit por IP; seeds solo por script.
- Honeypot, time-trap, límites de tamaño/URLs y cooldowns en el formulario.
- `noindex` + `no-store` + `frame-ancestors 'none'` en el panel.
- `.env` en `.gitignore`; el repo no contiene secretos.
- Sin endpoints de setup/status expuestos.

### 🔵 Cloudflare (recomendado como siguiente capa)
1. **Cloudflare Turnstile** en el formulario (gratis, invisible o no interactiva):
   - Añade un campo `cf-turnstile-response` al formulario y valida el token server-side en `/api/contact` con tu *secret key* (`POST https://challenges.cloudflare.com/turnstile/v0/siteverify`).
   - Es la alternativa de Cloudflare a reCAPTCHA/hCaptcha: sin CAPTCHAs visibles, sin privacidad invasiva, y corta bots que superan honeypot/time-trap.
2. **WAF + Rate limiting** (plan Free incluye reglas básicas):
   - Regla de rate limit: `POST /api/contact` → 10 req/min por IP (complementa tus cooldowns a nivel de aplicación).
   - Regla para `/api/auth/login`: 5 req/min por IP (refuerza el límite interno).
   - *Bot Fight Mode* para frenar scrapers en todo el sitio.
3. **Proxy DNS**: mantener el dominio con el *nube naranja* activada (proxy) oculta la IP real de Vercel y habilita WAF/CDN/bot protection.
4. Opcional: **Cloudflare Access** (Zero Trust) como capa extra para el panel: protege `/panel-*` con email/Google antes de que llegue a la app (aunque el secreto de la ruta ya está en el repo, ver punto siguiente).

### 🔑 Secretos y acceso
- **El nombre del panel (`panel-b84cbb776bb32b95.html`) está en el repositorio.** Si el repo es **público**, cualquiera puede descubrir la ruta — la seguridad real entonces depende solo del login. Opciones: (a) mantener el repo privado, (b) si el repo es público, tratar la ruta como conocida y exigir contraseña fuerte + Turnstile en el login, o (c) regenerar el token periódicamente (renombrar el archivo y actualizar `vite.config.ts` + `vercel.json` si aplica).
- **Rotación de secretos**: si algún día se filtra un `.env`, rota `PANEL_SESSION_SECRET`, `CONTACT_ENCRYPTION_KEY` y `CONTACT_HMAC_SECRET` (ojo: rotar `CONTACT_ENCRYPTION_KEY` invalida los datos ya cifrados — descifra primero, re-cifra, luego rota).
- **Vercel**: usa variables distintas para *Preview* y *Production* si trabajas con PRs; revisa que los *deployment protection* estén activos para evitar previews públicos accidentales.
- **Contraseña admin**: larga, única (no reutilizada de otras cuentas). Recuperar acceso: actualiza `ADMIN_PASS` en `.env` y vuelve a correr `pnpm seed:admin`.

### 🍪 Sesión (mejoras opcionales)
- Prefijo **`__Host-`** en la cookie (`__Host-triunity_session`): exige `Secure`, sin `Domain` y `Path=/` — impide que un subdominio comprometido la sobrescriba. (Cambio de una línea en `backend/src/lib/auth.ts`.)
- Sesión actual: 12 h. Si quieres más rigurosidad, baja a 2–4 h o añade *idle timeout*.
- Considera rotar el JWT al hacer login (ya se emite uno nuevo por login ✓).

### 📧 Resend / entregabilidad
- En Resend → Domains: verifica tu dominio y confirma los registros **SPF, DKIM y DMARC** (sin ellos, los correos caen en spam).
- Usa un remitente en tu dominio (ej. `no-reply@tudominio.com`), no un gmail.
- Revisa el *Logs* de Resend para detectar bounces; añade una política de supresión si hay rebotes repetidos.

### 🗄️ Neon
- Guarda la URL con el **pooler** separada por si migras a conexiones con pool (por ahora usamos la directa, correcta para neon-http).
- Activa **PITR/backups** según tu plan; el cifrado en app no sustituye backups.
- Credenciales de solo lectura para herramientas de análisis si las usas.

### 🧰 Código y dependencias
- Corre `pnpm audit` periódicamente para detectar CVEs en dependencias.
- `pnpm lint` + `pnpm build` en cada cambio (el backend también pasa por `tsc -b`).
- Los manejadores ya no imprimen datos sensibles en logs (solo errores); manténlo así: **nunca** loguees `password`, cookies ni el cuerpo completo de solicitudes.

### ⚖️ Datos personales (legal)
- Estás tratando nombre, email y mensaje de usuarios (datos personales). Recomendado:
  - Aviso de privacidad / política de privacidad enlazada junto al formulario.
  - Texto breve tipo *«Usamos tus datos solo para responder a tu solicitud»*.
  - Borrado de solicitudes antiguas desde el panel o por SQL periódicamente (retención mínima necesaria).

### 📋 Orden recomendado de siguientes pasos
1. Llena `DATABASE_URL`, `RESEND_API_KEY`, `RESEND_FROM`, `ADMIN_USER`, `ADMIN_PASS` en `.env`.
2. `pnpm db:push` → `pnpm seed:admin` → prueba el login del panel.
3. Configura las 6 env vars en Vercel y despliega.
4. Verifica el envío real del formulario (dominio Resend + `verify`).
5. Añade **Turnstile** al formulario y rate limiting en Cloudflare (los dos mayores saltos de seguridad pendientes).
6. Revisa la privacidad del repo (punto del token del panel) y `pnpm audit`.
