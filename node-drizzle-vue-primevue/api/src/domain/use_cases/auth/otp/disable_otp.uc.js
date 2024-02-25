const { joiMessages } = require('../../../../shared/utils/validations')
const { UserHistoryModel } = require("../../../entities/user.aggregate")

/**
 * Caso de uso: Desabilitar OTP
 * @param {Object} libs Bibliotecas
 * @param {import('joi')} libs.Joi
 * @param {import("../../../../adapters/database/repositories/user.repository")} repository Repositório de usuários
 */
function DisableOtpUseCase(libs, repository) {
  /**
   * Desabilita OTP
   * @param {DisableOtpRequest} request payload da requisição
   * @returns {DisableOtpResponse} payload do retorno
   */
  this.handleAsync = async function (request) {
    const response = new DisableOtpResponse()
    const { error } = validate(request)

    if (error) {
      response.error = true
      response.message = error.message
      return response
    }

    let user = await repository.getUserByUsername(request.username)

    if(!user) {
      response.error = true
      response.message = 'Usuário inválido'
      return response
    }

    user.otpEnabled = false

    await repository.updateUser(user)
    await repository.createUserHistory(new UserHistoryModel({
      operatorId: user.id,
      userId: user.id,
      event: UserHistoryModel.EVENT_USER_OTP_DISABLED,
      data: user
    }))

    response.disabled = true

    return response
  }

  /**
   * Valida a requisição
   * @param {DisableOtpRequest} request payload da requisição
   */
  function validate(request) {
    const schema = libs.Joi.object({
      username: libs.Joi.string().required().label('Email ou nome de usuário'),
    }).required().label("Requisição").messages(joiMessages)

    return schema.validate(request)
  }
}

/**
 * Modelo de requisição do desabilitar OTP
 * @param {object} options 
 * @param {string} options.username Nome de usuário alvo
*/
function DisableOtpRequest(options = {}) {
  this.username = options.username
}

/**
 * Modelo de resposta do desabilitar OTP
 */
function DisableOtpResponse() {
  this.error = undefined
  this.message = undefined
  this.disabled = false
}

const DisableOtpUseCaseName = 'uc.disable.otp'

module.exports = {
  DisableOtpUseCase,
  DisableOtpRequest,
  DisableOtpResponse,
  DisableOtpUseCaseName
}
