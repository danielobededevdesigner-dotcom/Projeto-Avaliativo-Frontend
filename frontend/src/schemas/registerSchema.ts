import { z } from 'zod'

export const registerSchema = z.object({
  name: z
    .string()
    .min(1, 'Informe o nome')
    .min(2, 'O nome deve ter pelo menos 2 caracteres'),

  email: z
    .string()
    .min(1, 'Informe o e-mail')
    .email('Informe um e-mail válido'),

  password: z
    .string()
    .min(1, 'Informe a senha')
    .min(6, 'A senha deve ter pelo menos 6 caracteres'),
})

export type RegisterFormData = z.infer<typeof registerSchema>