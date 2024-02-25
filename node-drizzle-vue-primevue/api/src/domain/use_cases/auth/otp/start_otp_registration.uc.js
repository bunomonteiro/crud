const { joiMessages } = require('../../../../shared/utils/validations')
const { UserHistoryModel } = require("../../../entities/user.aggregate")

/**
 * Caso de uso: Iniciar cadastro do segredo OTP
 * @param {Object} libs Bibliotecas
 * @param {import('joi')} libs.Joi Bibliotecas
 * @param {import('otpauth')} libs.OTPAuth Bibliotecas
 * @param {import('crypto')} libs.crypto Bibliotecas
 * @param {import("../../../../adapters/database/repositories/user.repository")} repository Repositório de usuários
 */
function StartOtpRegistrationUseCase(libs, repository) {
  /**
   * Inicia cadastro do segredo OTP
   * @param {StartOtpRegistrationRequest} request payload da requisição
   * @returns {StartOtpRegistrationResponse} payload do retorno
   */
  this.handleAsync = async function (request) {
    const response = new StartOtpRegistrationResponse()
    const { error } = validate(request)

    if (error) {
      response.error = true;
      response.message = error.message;
      return response;
    }

    const tokenSecret = libs.crypto.randomBytes(15).toString('hex')
    
    const totp = new libs.OTPAuth.TOTP({
      issuer: global.configurations.api.name,
      label: request.username,
      algorithm: 'SHA1',
      digits: 6,
      period: 30,
      secret: libs.OTPAuth.Secret.fromHex(tokenSecret),
    })

    const tokenUri = totp.toString()

    let user = await repository.getUserByUsername(request.username)

    if(!user) {
      response.error = true;
      response.message = 'Usuário inválido';
      return response;
    }

    if(user.otpEnabled || user.otpVerified) {
      response.error = true;
      response.message = 'Usuário já possui 2FA ativo';
      return response;
    }

    user.otpSecret = tokenSecret;
    user.otpUri = tokenUri
    user.otpEnabled = false
    user.otpVerified = false

    await repository.updateUser(user)
    await repository.createUserHistory(new UserHistoryModel({
      operatorId: user.id,
      userId: user.id,
      event: UserHistoryModel.EVENT_USER_OTP_REGISTERED,
      data: user
    }))

    response.tokenUri = tokenUri

    return response
  }

  /**
   * Valida a requisição
   * @param {StartOtpRegistrationRequest} request payload da requisição
   */
  function validate(request) {
    const schema = libs.Joi.object({
      username: libs.Joi.string().required().label('Email ou nome de usuário'),
    }).required().label("Requisição").messages(joiMessages)

    return schema.validate(request)
  }
}

/**
 * Modelo de requisição do inicio de cadastro do segredo OTP
 * @param {object} options 
 * @param {string} options.username Nome de usuário alvo
*/
function StartOtpRegistrationRequest(options = {}) {
  this.username = options.username
}

/**
 * Modelo de resposta do inicio do cadastro do segredo OTP
 */
function StartOtpRegistrationResponse() {
  this.error = undefined
  this.message = undefined
  this.tokenUri = undefined
}

const StartOtpRegistrationUseCaseName = 'uc.start.otp.registration'

module.exports = {
  StartOtpRegistrationUseCase,
  StartOtpRegistrationRequest,
  StartOtpRegistrationResponse,
  StartOtpRegistrationUseCaseName
};
