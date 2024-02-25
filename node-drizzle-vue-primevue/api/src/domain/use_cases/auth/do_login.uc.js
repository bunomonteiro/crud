
const { joiMessages } = require('../../../shared/utils/validations')
const { UserHistoryModel, UserModel } = require("../../entities/user.aggregate")

/**
 * Caso de uso: Efetuar Login
 * @param {Object} libs Bibliotecas
 * @param {import("jsonwebtoken")} libs.jwt
 * @param {import('joi')} libs.Joi
 * @param {import("../../../adapters/database/repositories/user.repository")} repository Repositório de usuários
 * @param {import('../../../adapters/security/password.service')} passwordService Repositório de usuários
 */
function DoLoginUseCase(libs, repository, passwordService) {
  /**
   * Efetua o login do usuário gerando o token jwt
   * @param {DoLoginRequest} request payload de entrada
   * @returns {Promise<DoLoginResponse>} payload de saída
   */
  this.handleAsync = async function (request) {
    const response = new DoLoginResponse()
    const { error } = validate(request)

    if (error) {
      response.error = true;
      response.message = error.message;
      return response;
    }

    const user = await repository.getUserByUsername(request.username)

    if (user && user.active && (await passwordService.compareAsync(request.password, user.password))) {
      const token = libs.jwt.sign({
        user: new DoLoginResponseUser(user)
      },
      global.configurations.api.auth.token.key,
      {
        issuer: global.configurations.api.uri,
        audience: global.configurations.api.alias,
        subject: user.username,
        expiresIn: global.configurations.api.auth.token.expiration
      })

      await repository.createUserHistory(new UserHistoryModel({
        operatorId: user.id,
        userId: user.id,
        event: UserHistoryModel.EVENT_USER_LOGGED_IN
      }))

      response.token = token;
    } else {
      response.error = true;
      response.message = "Credencial inválida";
    }

    return response;
  };

  /**
   * Valida a requisição
   * @param {DoLoginRequest} request payload de entrada
   */
  function validate(request) {
    const schema = libs.Joi.object({
      username: libs.Joi.string().min(3).max(32).required().label('Email ou nome de usuário'),
      password: libs.Joi.string().min(5).max(100).required().label('Senha'),
    }).required().label('Requisição').messages(joiMessages)

    return schema.validate(request)
  }
}

/**
 * Requisição do caso de uso
 * @param {Object} options
 * @param {string} options.username Nome de usuário (login) do usuário
 * @param {string} options.password Senha do usuário
 */
function DoLoginRequest(options = {}) {
  this.username = options.username;
  this.password = options.password;
}

/**
 * Resposta do caso de uso
 */
function DoLoginResponse() {
  this.error = undefined;
  this.message = undefined;
  this.token = undefined;
}

/**
 * Objeto usado internamente na resposta
 * @param {UserModel} model Modelo de usuário
 */
function DoLoginResponseUser(model) {
  this.id = model.id;
  this.name = model.name;
  this.email = model.email;
  this.username = model.username;
  this.active = model.active;
  this.avatar = model.avatar;
  this.cover = model.cover;
  this.otpEnabled = model.otpEnabled;
  this.otpVerified = model.otpVerified;
  this.otpValidated = false;
}

const DoLoginUseCaseName = 'uc.do.login'
module.exports = {
  DoLoginUseCase,
  DoLoginRequest,
  DoLoginResponse,
  DoLoginUseCaseName
};
