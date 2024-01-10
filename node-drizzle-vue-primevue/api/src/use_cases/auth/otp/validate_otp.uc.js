const { Pool } = require("pg");
const Joi = require('joi');
const jwt = require("jsonwebtoken");
const OTPAuth = require('otpauth');

const configurations = require('../../../services/configurations/configuration.service')
const UserRepository = require("../../../data/repositories/user.repository");
const { joiMessages } = require('../../../common/joi.helpers');
const { UserHistoryModel, UserModel } = require("../../../data/models");

/**
 * Caso de uso: Efetuar validação do token OTP
 * @param {Pool} connector
 */
function ValidateOtpUseCase(connector) {
  /**
   * Efetua validação do token OTP
   * @param {ValidateOtpRequest} request payload da requisição
   * @returns {ValidateOtpResponse} payload do retorno
   */
  this.handleAsync = async function (request) {
    const repository = new UserRepository(connector);
    const response = new ValidateOtpResponse();
    const { error } = validate(request);

    if (error) {
      response.error = true;
      response.message = error.message;
      console.error("[VALIDATION ERROR]", response);
      return response;
    }

    let user = await repository.getUserByUsername(request.username);

    if (!user.otpEnabled || !user.otpVerified) {
      response.error = true
      response.message = 'Token pendente de verificação';
      return response;
    }

    const otp = new OTPAuth.TOTP({
      issuer: configurations.api.name,
      label: request.username,
      algorithm: 'SHA1',
      digits: 6,
      period: 30,
      secret: OTPAuth.Secret.fromHex(user.otpSecret),
    });

    const delta = otp.validate({ token: request.code })

    if (delta === null) {
      response.error = true
      response.message = 'Token inválido ou usuário não existe'
      return response
    }

    const token = jwt.sign(
      {
        user: new ValidateOtpResponseUser(user, true)
      },
      configurations.api.auth.token.key,
      {
        issuer: configurations.api.uri,
        audience: configurations.api.alias,
        subject: user.username,
        expiresIn: configurations.api.auth.token.expiration
      }
    );

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
    const schema = Joi.object({
      username: Joi.string().required().label('Email ou nome de usuário'),
      code: Joi.number().integer().positive().required().label("Código OTP")
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

module.exports = {
  ValidateOtpUseCase,
  ValidateOtpRequest,
  ValidateOtpResponse,
};
