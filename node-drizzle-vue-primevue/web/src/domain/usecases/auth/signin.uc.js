import Joi, { messages as joiMessages } from '@/shared/helpers/joi'
import { usernameSchema, passwordSchema } from '@/domain/validations/user.schemas'

/**
 * Caso de uso: Acessar sistema
*/
export function SigninUseCase(api) {
  /**
   * Validação requisição
   * @param {SigninPayload} payload Parâmetros da requisição
   */
  function validate(payload) {
    const schema = Joi.object({
      username: usernameSchema,
      password: passwordSchema
    }).required().label('Acesso').messages(joiMessages)

    return schema.validate(payload)
  }

  /**
   * Acessa sistema
   * @param {SigninPayload} payload Parâmetros da requisição
   */
  this.handle = async function(payload = new UpdateUserPayload()) {
    const { error } = validate(payload);
    
    if (error) {
      return {
        error: true,
        message: error.message
      }
    }

    try {
      const response = await api.post('/api/v1/auth/actions/signin', {
        username: payload.username,
        password: payload.password
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
        message: 'Não foi possível acessar o sistema'
      }
    }
  }
}

/**
 * Parâmetros da requisição
 * @param {Object} options Payload da requisição
 * @param {string} options.username Login do usuário
 * @param {string} options.password Senha do usuário
 */
export function SigninPayload(options = {}) {
  this.username = options.username
  this.password = options.password
}