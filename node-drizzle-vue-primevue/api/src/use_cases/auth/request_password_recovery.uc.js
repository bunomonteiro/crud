const { Pool } = require("pg");
const path = require('path');
const url = require('url');
const Joi = require('joi');
const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc')

const configurations = require('../../services/configurations/configuration.service')
const cryptService = require('../../services/security/encryption.service');
const templateService = require('../../services/text/template.service');
const emailService = require('../../services/network/email.service');
const UserRepository = require("../../data/repositories/user.repository");
const { joiMessages } = require('../../common/joi.helpers');
const { UserHistoryModel } = require("../../data/models");

dayjs.extend(utc);

/**
 * Caso de uso: Solicitar recuperação de senha
 * @param {Pool} connector
 */
function RequestPasswordRecoveryUseCase(connector) {
  const EXPIRATION_MINUTES = 30;

  /**
   * Solicita recuperação de senha
   * @param {RequestPasswordRecoveryRequest} request payload de entrada
   * @returns {Promise<RequestPasswordRecoveryResponse>} payload de saída
   */
  this.handleAsync = async function (request) {
    const repository = new UserRepository(connector);
    const response = new RequestPasswordRecoveryResponse();
    const { error } = validate(request);

    if (error) {
      response.error = true;
      response.message = error.message;
      console.error("[VALIDATION ERROR]", response);
      return response;
    }

    const user = await repository.getUserByUsername(request.username);

    if(!user) {
      // Não deve informar se o usuário existe
      return response;
    }

    const passwordRecoveryToken = JSON.stringify({username: user.username, moment: dayjs.utc().add(EXPIRATION_MINUTES, 'minute').valueOf() });
    user.passwordRecoveryToken = cryptService.encrypt(passwordRecoveryToken);

    await repository.updateUser(user);    
    await repository.createUserHistory(new UserHistoryModel({
      operatorId: user.id,
      userId: user.id,
      event: UserHistoryModel.EVENT_USER_PASSWORD_RECOVERY_REQUESTED,
      data: user
    }))

    await emailService.sendAsync({
      to: user.email,
      subject: "Solicitação de Recuperação de Senha",
      html: templateService.compileFromPath(path.resolve(__dirname, "../../../public/templates/emails/password_recovery_requested.html"), {
        app_name: configurations.api.name,
        address_line1: "123123, Endereço linha 1",
        address_line2: "Endereço, Linha - 2",
        recovery_url: url.resolve(configurations.app.uri, `/auth/password-recovery/${user.passwordRecoveryToken}`)
      })
    })

    return response;
  };

  /**
   * Valida a requisição
   * @param {RequestPasswordRecoveryRequest} request payload de entrada
   */
  function validate(request) {
    const schema = Joi.object({
      username: Joi.string().min(3).max(32).required().label('Email ou nome de usuário'),
    }).required().label('Requisição').messages(joiMessages)

    return schema.validate(request);
  }
}

/**
 * Requisição do caso de uso
 * @param {Object} options
 * @param {string} options.username Nome de usuário (login) do usuário
 */
function RequestPasswordRecoveryRequest(options = {}) {
  this.username = options.username;
}

/**
 * Resposta do caso de uso
 */
function RequestPasswordRecoveryResponse() {
  this.error = undefined;
  this.message = undefined;
}

module.exports = {
  RequestPasswordRecoveryUseCase,
  RequestPasswordRecoveryRequest,
  RequestPasswordRecoveryResponse,
};
