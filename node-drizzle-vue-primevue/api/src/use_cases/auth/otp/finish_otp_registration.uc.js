const { Pool } = require("pg");
const Joi = require('joi');
const jwt = require("jsonwebtoken");
const OTPAuth = require('otpauth');

const configurations = require('../../../services/configurations/configuration.service')
const UserRepository = require("../../../data/repositories/user.repository");
const { joiMessages } = require('../../../common/joi.helpers');
const { UserHistoryModel } = require("../../../data/models");

/**
 * Caso de uso: Finalizar o registro do segredo OTP
 * @param {Pool} connector
 */
function FinishOtpRegistrationUseCase(connector) {
  /**
   * Finaliza o registro do segredo OTP
   * @param {FinishOtpRegistrationRequest} request payload da requisição
   * @returns {FinishOtpRegistrationResponse} payload do retorno
   */
  this.handleAsync = async function (request) {
    const repository = new UserRepository(connector);
    const response = new FinishOtpRegistrationResponse();
    const { error } = validate(request);

    if (error) {
      response.error = true;
      response.message = error.message;
      console.error("[VALIDATION ERROR]", response);
      return response;
    }

    let user = await repository.getUserByUsername(request.username);

    const otp = new OTPAuth.TOTP({
      issuer: configurations.api.name,
      label: request.username,
      algorithm: 'SHA1',
      digits: 6,
      period: 30,
      secret: OTPAuth.Secret.fromHex(user.otpSecret),
    });

    const delta = otp.validate({ token: request.code })

    if(delta === null) {
      response.error = true
      response.message = 'Token inválido ou usuário não existe'
      return response
    }
    
    user.otpEnabled = true;
    user.otpVerified = true;

    await repository.updateUser(user);
    await repository.createUserHistory(new UserHistoryModel({
      operatorId: user.id,
      userId: user.id,
      event: UserHistoryModel.EVENT_USER_OTP_VERIFIED,
      data: user
    }));

    const token = jwt.sign(
      {
        user: new FinishOtpRegistrationResponseUser(user, true)
      },
      configurations.api.auth.token.key,
      {
        issuer: configurations.api.uri,
        audience: configurations.api.alias,
        subject: user.username,
        expiresIn: configurations.api.auth.token.expiration
      }
    );

    response.token = token;

    return response
  }

  /**
   * Valida a requisição
   * @param {FinishOtpRegistrationRequest} request payload da requisição
   */
  function validate(request) {
    const schema = Joi.object({
      username: Joi.string().required().label('Email ou nome de usuário'),
      code: Joi.number().integer().positive().required().label("Código OTP")
    }).required().label("Requisição").messages(joiMessages)

    return schema.validate(request)
  }
}

/**
 * Modelo de requisição da finalização de registro do segredo OTP
 * @param {object} options 
 * @param {string} options.username Nome de usuário alvo
 * @param {number} options.code Código OTP a ser verificado
*/
function FinishOtpRegistrationRequest(options = {}) {
  this.username = options.username
  this.code = options.code
}

/**
 * Modelo de resposta da finalização de registro do segredo OTP
 */
function FinishOtpRegistrationResponse() {
  this.error = undefined
  this.message = undefined
  this.token = undefined
}

/**
 * Objeto usado internamento na resposta da finalização de registro do segredo OTP
 * @param {UserModel} model Modelo de usuário
 */
function FinishOtpRegistrationResponseUser(model, otpValidated) {
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

module.exports = {
  FinishOtpRegistrationUseCase,
  FinishOtpRegistrationRequest,
  FinishOtpRegistrationResponse,
};
