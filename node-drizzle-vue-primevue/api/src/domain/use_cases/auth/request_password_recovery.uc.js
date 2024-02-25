const templateCompiler = require('../../../shared/utils/text/template.service')
const { joiMessages } = require('../../../shared/utils/validations')
const { UserHistoryModel } = require("../../entities/user.aggregate")

/**
 * Caso de uso: Solicitar recuperação de senha
 * @param {Object} libs Bibliotecas
 * @param {import('path')} libs.path
 * @param {import('url')} libs.url
 * @param {import('joi')} libs.Joi
 * @param {import('dayjs')} libs.dayjs
 * @param {import("../../../adapters/database/repositories/user.repository")} repository Repositório de usuários
 * @param {import('../../../adapters/security/encryption.service')} cryptService Serviço de criptografia
 * @param {import('../../../adapters/network/email.service')} emailService Serviço de envio de email
 */
function RequestPasswordRecoveryUseCase(libs, repository, cryptService, emailService) {
  const EXPIRATION_MINUTES = 30

  /**
   * Solicita recuperação de senha
   * @param {RequestPasswordRecoveryRequest} request payload de entrada
   * @returns {Promise<RequestPasswordRecoveryResponse>} payload de saída
   */
  this.handleAsync = async function (request) {
    const response = new RequestPasswordRecoveryResponse()
    const { error } = validate(request)

    if (error) {
      response.error = true
      response.message = error.message
      return response
    }

    const user = await repository.getUserByUsername(request.username)

    if(!user) {
      // Não deve informar se o usuário existe
      return response
    }

    const passwordRecoveryToken = JSON.stringify({username: user.username, moment: libs.dayjs.utc().add(EXPIRATION_MINUTES, 'minute').valueOf() })
    user.passwordRecoveryToken = cryptService.encrypt(passwordRecoveryToken)

    await repository.updateUser(user)    
    await repository.createUserHistory(new UserHistoryModel({
      operatorId: user.id,
      userId: user.id,
      event: UserHistoryModel.EVENT_USER_PASSWORD_RECOVERY_REQUESTED,
      data: user
    }))

    await emailService.sendAsync({
      to: user.email,
      subject: "Solicitação de Recuperação de Senha",
      html: templateCompiler.compileFromPath(libs.path.resolve(__dirname, "../../../../public/templates/emails/password_recovery_requested.html"), {
        app_name: global.configurations.api.name,
        address_line1: "123123, Endereço linha 1",
        address_line2: "Endereço, Linha - 2",
        recovery_url: libs.url.resolve(global.configurations.app.uri, `/auth/password-recovery/${user.passwordRecoveryToken}`)
      })
    })

    return response
  }

  /**
   * Valida a requisição
   * @param {RequestPasswordRecoveryRequest} request payload de entrada
   */
  function validate(request) {
    const schema = libs.Joi.object({
      username: libs.Joi.string().min(3).max(32).required().label('Email ou nome de usuário'),
    }).required().label('Requisição').messages(joiMessages)

    return schema.validate(request)
  }
}

/**
 * Requisição do caso de uso
 * @param {Object} options
 * @param {string} options.username Nome de usuário (login) do usuário
 */
function RequestPasswordRecoveryRequest(options = {}) {
  this.username = options.username
}

/**
 * Resposta do caso de uso
 */
function RequestPasswordRecoveryResponse() {
  this.error = undefined
  this.message = undefined
}

const RequestPasswordRecoveryUseCaseName = 'uc.request.password.recovery'

module.exports = {
  RequestPasswordRecoveryUseCase,
  RequestPasswordRecoveryRequest,
  RequestPasswordRecoveryResponse,
  RequestPasswordRecoveryUseCaseName
}
