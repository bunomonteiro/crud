import Joi, { messages as joiMessages } from '@/shared/helpers/joi'
import { usernameSchema } from '@/domain/validations/user.schemas'

/**
 * Caso de uso: Solicitar recuperação de senha
*/
export function RequestPasswordRecoveryUseCase(api) {
  /**
   * Validação requisição
   * @param {RequestPasswordRecoveryPayload} payload Parâmetros da requisição
   */
  function validate(payload) {
    const schema = Joi.object({
      username: usernameSchema
    }).required().label('Solicitação').messages(joiMessages)

    return schema.validate(payload);
  }

  /**
   * Solicita recuperação de senha
   * @param {RequestPasswordRecoveryPayload} payload Parâmetros da requisição
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
      const response = await api.post('/api/v1/auth/actions/request-password-recovery', {
        username: payload.username
      })

      return {
        error: response.error,
        message: response.message
      }
    } catch (error) {
      return {
        error: error,
        message: 'Não foi possível solicitar a recuperação de senha'
      };
    }
  }
}

/**
 * Parâmetros da requisição
 * @param {Object} options Payload da requisição
  * @param {string} options.username Login do usuário
 */
export function RequestPasswordRecoveryPayload(options = {}) {
  this.username = options.username
}