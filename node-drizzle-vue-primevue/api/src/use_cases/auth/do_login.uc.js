const { Pool } = require("pg");
const jwt = require("jsonwebtoken");
const Joi = require('joi');

const configurations = require('../../services/configurations/configuration.service')
const passwordService = require('../../services/security/password.service');
const UserRepository = require("../../data/repositories/user.repository");
const { joiMessages } = require('../../common/joi.helpers');
const { UserHistoryModel, UserModel } = require("../../data/models");

/**
 * Caso de uso: Efetuar Login
 * @param {Pool} connector
 */
function DoLoginUseCase(connector) {
  /**
   * Efetua o login do usuário gerando o token jwt
   * @param {DoLoginRequest} request payload de entrada
   * @returns {Promise<DoLoginResponse>} payload de saída
   */
  this.handleAsync = async function (request) {
    const repository = new UserRepository(connector);
    const response = new DoLoginResponse();
    const { error } = validate(request);

    if (error) {
      response.error = true;
      response.message = error.message;
      console.error("[VALIDATION ERROR]", response);
      return response;
    }

    const user = await repository.getUserByUsername(request.username);

    if (user && user.active && (await passwordService.compareAsync(request.password, user.password))) {
      const token = jwt.sign({
        user: new DoLoginResponseUser(user)
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
    const schema = Joi.object({
      username: Joi.string().min(3).max(32).required().label('Email ou nome de usuário'),
      password: Joi.string().min(5).max(100).required().label('Senha'),
    }).required().label('Requisição').messages(joiMessages)

    return schema.validate(request);
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

module.exports = {
  DoLoginUseCase,
  DoLoginRequest,
  DoLoginResponse,
};
