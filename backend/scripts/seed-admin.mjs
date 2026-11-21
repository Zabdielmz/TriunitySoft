import 'dotenv/config'
import bcrypt from 'bcryptjs'
import { neon } from '@neondatabase/serverless'

const user = process.env.ADMIN_USER
const pass = process.env.ADMIN_PASS
const url = process.env.DATABASE_URL

if (!url) {
  console.error('Falta DATABASE_URL en .env')
  process.exit(1)
}
if (!user || !pass) {
  console.error('Falta ADMIN_USER o ADMIN_PASS en .env')
  process.exit(1)
}
if (user.length < 3) {
  console.error('ADMIN_USER debe tener al menos 3 caracteres')
  process.exit(1)
}
if (pass.length < 8) {
  console.error('ADMIN_PASS debe tener al menos 8 caracteres')
  process.exit(1)
}

const sql = neon(url)
const passwordHash = await bcrypt.hash(pass, 12)

const rows = await sql`
  INSERT INTO admin_users (username, password_hash)
  VALUES (${user}, ${passwordHash})
  ON CONFLICT (username) DO UPDATE SET password_hash = EXCLUDED.password_hash
  RETURNING username, (xmax = 0) AS created
`

const row = rows[0]
const created = row?.created === true
console.log(
  created
    ? `✓ Admin creado: ${row.username}`
    : `✓ Contraseña actualizada para: ${row?.username ?? user}`,
)
