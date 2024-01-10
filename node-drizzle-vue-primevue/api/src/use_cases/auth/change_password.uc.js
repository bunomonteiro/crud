const { Pool } = require("pg");
const path = require('path');
const Joi = require('joi');
const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc')

const configurations = require('../../services/configurations/configuration.service')
const cryptService = require('../../services/security/encryption.service');
const passwordService = require('../../services/security/password.service');
const templateService = require('../../services/text/template.service');
const emailService = require('../../services/network/email.service');
const UserRepository = require("../../data/repositories/user.repository");
const { joiMessages } = require('../../common/joi.helpers');
const { UserHistoryModel, UserModel } = require("../../data/models");

dayjs.extend(utc);

/**
 * Caso de uso: Mudar senha
 * @param {Pool} connector
 */
function ChangePasswordUseCase(connector) {
  /**
   * Muda a senha
   * @param {ChangePasswordRequest} request payload de entrada
   * @returns {Promise<ChangePasswordResponse>} payload de saída
   */
  this.handleAsync = async function (request) {
    const repository = new UserRepository(connector);
    const response = new ChangePasswordResponse();
    const { error } = validate(request);

    if (error) {
      response.error = true;
      response.message = error.message;
      console.error("[VALIDATION ERROR]", response);
      return response;
    }

    const token = JSON.parse(cryptService.decrypt(request.token));
    let user = await repository.getUserByUsername(token.username);

    if(!user || user.passwordRecoveryToken !== request.token || dayjs.utc().diff(dayjs.utc(token.moment)) >= 0) {
      response.error = true;
      response.message = "Token de recuperação de senha inválido";
      return response;
    }

    user.passwordRecoveryToken = null;
    user.password = await passwordService.hashAsync(request.password);    
    await repository.updateUser(user);    

    await repository.createUserHistory(new UserHistoryModel({
      operatorId: user.id,
      userId: user.id,
      event: UserHistoryModel.EVENT_USER_PASSWORD_CHANGED,
      data: user
    }))

    await emailService.sendAsync({
      to: user.email,
      subject: "Senha Alterada",
      html: templateService.compileFromPath(path.resolve(__dirname, "../../../public/templates/emails/password_changed.html"), {
        user_name: user.name,
        app_name: configurations.api.name,
        app_url: configurations.app.uri,
        address_line1: "123123, Endereço linha 1",
        address_line2: "Endereço, Linha - 2",
      })
    })

    return response;
  };

  /**
   * Valida a requisição
   * @param {ChangePasswordRequest} request payload de entrada
   */
  function validate(request) {
    const schema = Joi.object({
      token: Joi.string().required().label('Token'),
      password: Joi.string().min(8).max(128)
        .regex(/[0-9]+/, { name: 'ao menos um número' }) // Ao menos um número em qualquer posição
        .regex(/[a-z]+/, { name: 'ao menos uma letra minúscula' }) // Ao menos uma letra minúscula em qualquer posição
        .regex(/[A-Z]+/, { name: 'ao menos uma leta maiúscula' }) // Ao menos uma letra maiúscula em qualquer posição
        .required().label('Senha'),
    }).required().label('Requisição').messages(joiMessages)

    return schema.validate(request);
  }
}

/**
 * Requisição do caso de uso
 * @param {Object} options
 * @param {string} options.token Token de solicitação de recuperação de senha
 * @param {string} options.password Nova senha do usuário
 */
function ChangePasswordRequest(options = {}) {
  this.token = options.token;
  this.password = options.password;
}

/**
 * Resposta do caso de uso
 */
function ChangePasswordResponse() {
  this.error = undefined;
  this.message = undefined;
}

module.exports = {
  ChangePasswordUseCase,
  ChangePasswordRequest,
  ChangePasswordResponse,
};
