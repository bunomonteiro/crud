const { Pool } = require("pg");
const Joi = require('joi');
const OTPAuth = require('otpauth');
const crypto = require('crypto');

const UserRepository = require("../../../data/repositories/user.repository");
const { joiMessages } = require('../../../common/joi.helpers');
const { UserHistoryModel } = require("../../../data/models");

/**
 * Caso de uso: Obter a URI do do OTP
 * @param {Pool} connector
 */
function GetOtpUriUseCase(connector) {
  /**
   * Obtém a URI do OTP
   * @param {GetOtpUriRequest} request payload da requisição
   * @returns {GetOtpUriResponse} payload do retorno
   */
  this.handleAsync = async function (request) {
    const repository = new UserRepository(connector);
    const response = new GetOtpUriResponse();
    const { error } = validate(request);

    if (error) {
      response.error = true;
      response.message = error.message;
      console.error("[VALIDATION ERROR]", response);
      return response;
    }

    let user = await repository.getUserByUsername(request.username);

    await repository.createUserHistory(new UserHistoryModel({
      operatorId: user.id,
      userId: user.id,
      event: UserHistoryModel.EVENT_USER_REQUESTED_OTP_URI
    }));

    if(!user.otpEnabled || !user.otpVerified) {
      response.error = true;
      response.message = "Usuário não possui 2FA habilitada";
      return response;
    }

    response.tokenUri = user.otpUri

    return response
  }

  /**
   * Valida a requisição
   * @param {GetOtpUriRequest} request payload da requisição
   */
  function validate(request) {
    const schema = Joi.object({
      username: Joi.string().required().label('Email ou nome de usuário'),
    }).required().label("Requisição").messages(joiMessages)

    return schema.validate(request)
  }
}

/**
 * Modelo de requisição da obtenção da URI do OTP
 * @param {object} options 
 * @param {string} options.username Nome de usuário alvo
*/
function GetOtpUriRequest(options = {}) {
  this.username = options.username
}

/**
 * Modelo de resposta da obtenção da URI do OTP
 */
function GetOtpUriResponse() {
  this.error = undefined
  this.message = undefined
  this.tokenUri = undefined
}

module.exports = {
  GetOtpUriUseCase,
  GetOtpUriRequest,
  GetOtpUriResponse,
};
