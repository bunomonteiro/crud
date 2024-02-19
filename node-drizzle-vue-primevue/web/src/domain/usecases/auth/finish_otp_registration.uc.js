import Joi, { messages as joiMessages } from '@/shared/helpers/joi'

/**
 * Caso de uso: Finalizar processo de ativação de autenticação em duas etapas
*/
export function FinishOtpRegistrationUseCase(api) {
  /**
   * Validação requisição
   * @param {FinishOtpRegistrationPayload} payload Parâmetros da requisição
   */
  function validate(payload) {
    const schema = Joi.object({
      code: Joi.string().length(6).required().label('Código')
    }).required().label('Registro de 2FA').messages(joiMessages)

    return schema.validate(payload)
  }

  /**
   * Finaliza processo de ativação de autenticação em duas etapas
   * @param {FinishOtpRegistrationPayload} payload Parâmetros da requisição
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
      const response = await api.post('/api/v1/auth/otp/actions/finish-registration', { code: payload.code })

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
        message: 'Não foi possível ativar a autenticação em duas etapas'
      };
    }
  }
}

/**
 * Parâmetros da requisição
 * @param {Object} options Payload da requisição
 * @param {string} options.code Código TOTP
 */
export function FinishOtpRegistrationPayload(options = {}) {
  this.code = options.code
}