import Joi, { messages as joiMessages } from '@/shared/helpers/joi'
import { passwordSchema } from '@/domain/validations/user.schemas'

/**
 * Caso de uso: Registrar de usuário
*/
export function ChangePasswordUseCase(api) {
  /**
   * Validação requisição
   * @param {ChangePasswordPayload} payload Parâmetros da requisição
   */
  function validate(payload) {
    const schema = Joi.object({
      token: Joi.string().required().label('Token'),
      password: passwordSchema
    }).required().label('Alteração de senha').messages(joiMessages)

    return schema.validate(payload);
  }

  /**
   * Registra usuário
   * @param {ChangePasswordPayload} payload Parâmetros da requisição
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
      const response = await api.post(`/api/v1/auth/actions/change-password/${payload.token}`, {
        password: payload.password
      })

      return {
        error: response.error,
        message: response.message
      }
    } catch (error) {
      return {
        error: error,
        message: 'Solicite a alteração de senha novamente.'
      };
    }
  }
}

/**
 * Parâmetros da requisição
 * @param {Object} options Payload da requisição
 * @param {string} options.token Token de recuperação de senha
 * @param {string} options.password Nova senha
 */
export function ChangePasswordPayload(options = {}) {
  this.token = options.token
  this.password = options.password
}