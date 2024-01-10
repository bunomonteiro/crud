const { Pool } = require("pg");
const Joi = require('joi');
const OTPAuth = require('otpauth');

const UserRepository = require("../../../data/repositories/user.repository");
const { joiMessages } = require('../../../common/joi.helpers');
const { UserHistoryModel } = require("../../../data/models");

/**
 * Caso de uso: Desabilitar OTP
 * @param {Pool} connector
 */
function DisableOtpUseCase(connector) {
  /**
   * Desabilita OTP
   * @param {DisableOtpRequest} request payload da requisição
   * @returns {DisableOtpResponse} payload do retorno
   */
  this.handleAsync = async function (request) {
    const repository = new UserRepository(connector);
    const response = new DisableOtpResponse();
    const { error } = validate(request);

    if (error) {
      response.error = true;
      response.message = error.message;
      console.error("[VALIDATION ERROR]", response);
      return response;
    }

    let user = await repository.getUserByUsername(request.username);
    user.otpEnabled = false;

    await repository.updateUser(user);
    await repository.createUserHistory(new UserHistoryModel({
      operatorId: user.id,
      userId: user.id,
      event: UserHistoryModel.EVENT_USER_OTP_DISABLED,
      data: user
    }));

    response.disabled = true;

    return response
  }

  /**
   * Valida a requisição
   * @param {DisableOtpRequest} request payload da requisição
   */
  function validate(request) {
    const schema = Joi.object({
      username: Joi.string().required().label('Email ou nome de usuário'),
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

module.exports = {
  DisableOtpUseCase,
  DisableOtpRequest,
  DisableOtpResponse,
};
