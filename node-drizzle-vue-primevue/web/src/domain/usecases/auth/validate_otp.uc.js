import Joi, { messages as joiMessages } from '@/shared/helpers/joi'

/**
 * Caso de uso: Validar código de autenticação em duas etapas
 */
export function ValidateOtpUseCase(api) {
  /**
   * Validação requisição
   * @param {ValidateOtpPayload} payload Parâmetros da requisição
   */
  function validate(payload) {
    const schema = Joi.object({
      code: Joi.string().length(6).required().label('Código'),
    }).required().label('Validação').messages(joiMessages)

    return schema.validate(payload)
  }

  /**
   * Valida código de autenticação em duas etapas
   * @param {ValidateOtpPayload} payload Parâmetros da requisição
   */
  this.handle = async function(payload) {
    const { error } = validate(payload);

    if (error) {
      return {
        error: true,
        message: error.message
      }
    }

    try {
      const response = await api.post('/api/v1/auth/otp/actions/validate', { 
        code: payload.code
      })

      if (response?.error) {
        return {
          error: true,
          message: response.message
        }
      }

      return {
        data: response?.data?.token
      }
    } catch (error) {
      return {
        error: error,
        message: 'Código inválido'
      }
    }
  }
}

/**
 * Parâmetros da requisição
 * @param {Object} options Payload da requisição
 * @param {string} options.code Código TOTP
 */
export function ValidateOtpPayload(options = {}) {
  this.code = options.code
}