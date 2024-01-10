const { Pool } = require("pg");
const Joi = require('joi');
const OTPAuth = require('otpauth');
const crypto = require('crypto');

const configurations = require('../../../services/configurations/configuration.service')
const UserRepository = require("../../../data/repositories/user.repository");
const { joiMessages } = require('../../../common/joi.helpers');
const { UserHistoryModel } = require("../../../data/models");

/**
 * Caso de uso: Iniciar cadastro do segredo OTP
 * @param {Pool} connector
 */
function StartOtpRegistrationUseCase(connector) {
  /**
   * Inicia cadastro do segredo OTP
   * @param {StartOtpRegistrationRequest} request payload da requisição
   * @returns {StartOtpRegistrationResponse} payload do retorno
   */
  this.handleAsync = async function (request) {
    const repository = new UserRepository(connector);
    const response = new StartOtpRegistrationResponse();
    const { error } = validate(request);

    if (error) {
      response.error = true;
      response.message = error.message;
      console.error("[VALIDATION ERROR]", response);
      return response;
    }

    const tokenSecret = crypto.randomBytes(15).toString('hex');
    
    const totp = new OTPAuth.TOTP({
      issuer: configurations.api.name,
      label: request.username,
      algorithm: 'SHA1',
      digits: 6,
      period: 30,
      secret: OTPAuth.Secret.fromHex(tokenSecret),
    });

    const tokenUri = totp.toString()

    let user = await repository.getUserByUsername(request.username);
    user.otpSecret = tokenSecret;
    user.otpUri = tokenUri

    await repository.updateUser(user);
    await repository.createUserHistory(new UserHistoryModel({
      operatorId: user.id,
      userId: user.id,
      event: UserHistoryModel.EVENT_USER_OTP_REGISTERED,
      data: user
    }));

    response.tokenUri = tokenUri

    return response
  }

  /**
   * Valida a requisição
   * @param {StartOtpRegistrationRequest} request payload da requisição
   */
  function validate(request) {
    const schema = Joi.object({
      username: Joi.string().required().label('Email ou nome de usuário'),
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

module.exports = {
  StartOtpRegistrationUseCase,
  StartOtpRegistrationRequest,
  StartOtpRegistrationResponse,
};
