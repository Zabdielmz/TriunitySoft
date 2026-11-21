import { boolean, index, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'

export const contactSubmissions = pgTable(
  'contact_submissions',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    category: text('category').notNull(),
    nameEnc: text('name_enc').notNull(),
    emailEnc: text('email_enc').notNull(),
    messageEnc: text('message_enc').notNull(),
    emailHash: text('email_hash').notNull(),
    ipHash: text('ip_hash').notNull(),
    read: boolean('read').notNull().default(false),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    emailIdx: index('contact_submissions_email_hash_created_at_idx').on(table.emailHash, table.createdAt),
    ipIdx: index('contact_submissions_ip_hash_created_at_idx').on(table.ipHash, table.createdAt),
  }),
)

export const adminUsers = pgTable('admin_users', {
  id: uuid('id').defaultRandom().primaryKey(),
  username: text('username').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})

export const notifyEmails = pgTable('notify_emails', {
  id: uuid('id').defaultRandom().primaryKey(),
  email: text('email').notNull().unique(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})

export const loginAttempts = pgTable(
  'login_attempts',
  {
    ipHash: text('ip_hash').notNull(),
    attemptedAt: timestamp('attempted_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    ipIdx: index('login_attempts_ip_hash_attempted_at_idx').on(table.ipHash, table.attemptedAt),
  }),
)
