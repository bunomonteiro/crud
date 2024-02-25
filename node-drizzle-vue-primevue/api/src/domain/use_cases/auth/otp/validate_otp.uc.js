const { joiMessages } = require('../../../../shared/utils/validations')
const { UserHistoryModel, UserModel } = require("../../../entities/user.aggregate")

/**
 * Caso de uso: Efetuar validação do token OTP
 * @param {Object} libs Bibliotecas
 * @param {import('joi')} libs.Joi
 * @param {import("jsonwebtoken")} libs.jwt
 * @param {import('otpauth')} libs.OTPAuth
 * @param {import("../../../../adapters/database/repositories/user.repository")} repository Repositório de usuários
 */
function ValidateOtpUseCase(libs, repository) {
  /**
   * Efetua validação do token OTP
   * @param {ValidateOtpRequest} request payload da requisição
   * @returns {ValidateOtpResponse} payload do retorno
   */
  this.handleAsync = async function (request) {
    const response = new ValidateOtpResponse()
    const { error } = validate(request)

    if (error) {
      response.error = true;
      response.message = error.message;
      return response;
    }

    let user = await repository.getUserByUsername(request.username)

    if (!user) {
      response.error = true
      response.message = 'Usuário inválido';
      return response;
    }

    if (!user.otpEnabled || !user.otpVerified) {
      response.error = true
      response.message = 'Token pendente de verificação';
      return response;
    }

    const otp = new libs.OTPAuth.TOTP({
      issuer: global.configurations.api.name,
      label: request.username,
      algorithm: 'SHA1',
      digits: 6,
      period: 30,
      secret: libs.OTPAuth.Secret.fromHex(user.otpSecret),
    })

    const delta = otp.validate({ token: request.code })

    if (delta === null) {
      response.error = true
      response.message = 'Token inválido ou usuário não existe'
      return response
    }

    const token = libs.jwt.sign(
      {
        user: new ValidateOtpResponseUser(user, true)
      },
      global.configurations.api.auth.token.key,
      {
        issuer: global.configurations.api.uri,
        audience: global.configurations.api.alias,
        subject: user.username,
        expiresIn: global.configurations.api.auth.token.expiration
      }
    )

    await repository.createUserHistory(new UserHistoryModel({
      operatorId: user.id,
      userId: user.id,
      event: UserHistoryModel.EVENT_USER_LOGGED_IN_WITH_OTP
    }))

    response.token = token;

    return response
  }

  /**
   * Valida a requisição
   * @param {ValidateOtpRequest} request payload da requisição
   */
  function validate(request) {
    const schema = libs.Joi.object({
      username: libs.Joi.string().required().label('Email ou nome de usuário'),
      code: libs.Joi.number().integer().positive().required().label("Código OTP")
    }).required().label("Requisição").messages(joiMessages)

    return schema.validate(request)
  }
}

/**
 * Modelo de requisição da verificação do segredo OTP
 * @param {object} options 
 * @param {string} options.username Nome de usuário alvo
 * @param {number} options.code Código OTP a ser validado
*/
function ValidateOtpRequest(options = {}) {
  this.username = options.username
  this.code = options.code
}

/**
 * Modelo de resposta da verificação do segredo OTP
 */
function ValidateOtpResponse() {
  this.error = undefined
  this.message = undefined
  this.token = undefined
}

/**
 * Objeto usado internamento na resposta da verificação do segredo OTP
 * @param {UserModel} model Modelo de usuário
 */
function ValidateOtpResponseUser(model, otpValidated) {
  this.id = model.id;
  this.name = model.name;
  this.email = model.email;
  this.username = model.username;
  this.active = model.active;
  this.avatar = model.avatar;
  this.cover = model.cover;
  this.otpEnabled = model.otpEnabled;
  this.otpVerified = model.otpVerified;
  this.otpValidated = otpValidated;
}

const ValidateOtpUseCaseName = 'uc.validate.otp'

module.exports = {
  ValidateOtpUseCase,
  ValidateOtpRequest,
  ValidateOtpResponse,
  ValidateOtpUseCaseName
};
