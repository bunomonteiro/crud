import Joi, { messages as joiMessages } from '@/shared/helpers/joi'

export const usernameSchema = Joi.string().min(3).max(32).required().label("Login").messages(joiMessages)

export const passwordSchema = Joi.string()
  .min(8).max(128)
  .regex(/[0-9]+/, { name: 'ao menos um número' }) // Ao menos um número em qualquer posição
  .regex(/[a-z]+/, { name: 'ao menos uma letra minúscula' }) // Ao menos uma letra minúscula em qualquer posição
  .regex(/[A-Z]+/, { name: 'ao menos uma leta maiúscula' }) // Ao menos uma letra maiúscula em qualquer posição
  .required().label("Senha")
  .messages(joiMessages)

export const confirmPasswordSchema = Joi.object({
  password: passwordSchema,
  confirmPassword: Joi.string().required().valid(Joi.ref('password')).label('Confirmação').messages({...joiMessages, "any.only": '"Confirmação" deve ser igual a "Senha"'})
})

export const nameSchema = Joi.string().min(2).max(32).required().label('Nome do usuário').messages(joiMessages)
export const emailSchema = Joi.string().email({ tlds: false }).max(128).required().label('Email').messages(joiMessages)
export const avatarSchema = Joi.string().uri().optional().label('Url da Imagem').messages(joiMessages)
export const coverSchema = Joi.string().uri().optional().label('Url da Capa').messages(joiMessages)

export const userSchema = Joi.object({
  username: usernameSchema,
  password: passwordSchema,
  name: nameSchema,
  email: emailSchema,
  avatar: avatarSchema,
  cover: coverSchema,
}).messages(joiMessages)