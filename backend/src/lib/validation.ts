import { z } from 'zod'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const emailField = z
  .string()
  .trim()
  .min(5, 'Email demasiado corto')
  .max(254, 'Email demasiado largo')
  .refine((value) => EMAIL_PATTERN.test(value), 'Email inválido')

export const contactSchema = z.object({
  name: z.string().trim().min(2, 'Nombre demasiado corto').max(100, 'Nombre demasiado largo'),
  email: emailField,
  category: z.enum(['software', 'web', 'videojuego', 'otro']),
  message: z.string().trim().min(10, 'Mensaje demasiado corto').max(2000, 'Mensaje demasiado largo'),
  startedAt: z.number().int(),
  website: z.string().max(500).optional(),
})

export const loginSchema = z.object({
  username: z.string().trim().min(3).max(64),
  password: z.string().min(1).max(128),
})

export const notifyEmailSchema = z.object({
  email: emailField,
})

export const markReadSchema = z.object({
  id: z.uuid(),
  read: z.boolean(),
})

export const removeNotifySchema = z.object({
  id: z.uuid(),
})
