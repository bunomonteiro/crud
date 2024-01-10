const { Pool } = require("pg");
const Joi = require('joi');

const UserRepository = require("../../data/repositories/user.repository");
const { joiMessages } = require('../../common/joi.helpers');
const { UserModel } = require("../../data/models");

/**
 * Caso de uso: Obter usuário
 * @param {Pool} connector
 */
function GetUserUseCase(connector) {
  /**
   * Obtém um usuário por id ou username
   * @param { GetUserRequest } request payload de entrada
   * @returns {Promise<GetUserResponse>} payload de saída
   */
  this.handleAsync = async function (request) {
    const repository = new UserRepository(connector);
    const response = new GetUserResponse();
    const { error } = validate(request);

    if (error) {
      response.error = true;
      console.error("[VALIDATION ERROR]", response);
      return response;
    }

    let user;
    if (request.id) {
      user = await repository.getUserById(request.id);
    } else {
      user = await repository.getUserByUsername(request.username);
    }

    response.user = new GetUserResponseUser(user);

    return response;
  };

  /**
   * Valida a requisição
   * @param {GetUserRequest} request payload de entrada
   */
  function validate(request) {
    const schema = Joi.object({
      id: Joi.number().positive().label('Nome do usuário'),
      username: Joi.string().min(3).max(32).label('Nome de usuário (login)')
    }).or('id', 'username').required().label('Requisição').messages(joiMessages)

    return schema.validate(request);
  }
}

/**
 * Requisição do caso de uso
 * @param {Object} options
 * @param {number} options.id Identificador do usuário alvo
 * @param {string} options.username Nome de usuário (login) do usuário alvo
 */
function GetUserRequest(options = {}) {
  this.id = options.id;
  this.username = options.username;
}

/**
 * Resposta do caso de uso
 */
function GetUserResponse() {
  this.error = undefined;
  this.message = undefined;
  this.user = undefined;
}

/**
 * Objeto usado internamente na resposta
 * @param {UserModel} model Modelo de usuário
 */
function GetUserResponseUser(model) {
  this.id = model.id;
  this.name = model.name;
  this.email = model.email;
  this.username = model.username;
  this.active = model.active;
  this.avatar = model.avatar;
  this.cover = model.cover;
  this.otpEnabled = model.otpEnabled;
  this.otpVerified = model.otpVerified;
}

module.exports = {
  GetUserUseCase,
  GetUserRequest,
  GetUserResponse,
};
