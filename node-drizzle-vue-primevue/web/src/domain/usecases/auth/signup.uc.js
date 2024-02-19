import Joi, { messages as joiMessages } from '@/shared/helpers/joi'
import { nameSchema, emailSchema, usernameSchema, passwordSchema, avatarSchema, coverSchema } from '@/domain/validations/user.schemas'

/**
 * Caso de uso: Registrar de usuário
*/
export function SignupUseCase(api) {
  /**
   * Validação requisição
   * @param {SignupPayload} payload Parâmetros da requisição
   */
  function validate(payload) {
    const schema = Joi.object({
      name: nameSchema,
      email: emailSchema,
      username: usernameSchema,
      password: passwordSchema,
      avatar: avatarSchema,
      cover: coverSchema,
    }).required().label('Registro').messages(joiMessages)

    return schema.validate(payload);
  }

  /**
   * Registra usuário
   * @param {SignupPayload} payload Parâmetros da requisição
   */
  this.handle = async function(payload = new UpdateUserPayload()) {
    const { error } = validate(payload);
    
    if (error) {
      return {
        error: true,
        message: error.message
      };
    }

    try {
      const response = await api.post(`/api/v1/auth/actions/signup`, {
        name: payload.name,
        email: payload.email,
        username: payload.username,
        password: payload.password,
        avatar: payload.avatar,
        cover: payload.cover
      })

      if (response?.error) {
        return {
          error: true,
          message: response.message
        }
      }

      return {
        data: response?.data?.token,
      }
    } catch (error) {
      return {
        error: error,
        message: 'Não foi possível registrar o usuário'
      };
    }
  }
}

/**
 * Parâmetros da requisição
 * @param {Object} options Payload da requisição
 * @param {string} options.name Nome do usuário
 * @param {string} options.email Email do usuário
 * @param {string} options.username Login do usuário
 * @param {string} options.password Senha do usuário
 * @param {string} options.avatar Endereço URL da imagem do novo usuário
 * @param {string} options.cover Endereço URL da capa do novo usuário
 */
export function SignupPayload(options = {}) {
  this.name = options.name
  this.email = options.email
  this.username = options.username
  this.password = options.password
  this.avatar = options.avatar
  this.cover = options.cover
}