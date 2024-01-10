const { Pool } = require("pg");
const Joi = require('joi');

const passwordService = require('../../services/security/password.service');
const UserRepository = require("../../data/repositories/user.repository");
const { UserModel, UserHistoryModel } = require("../../data/models");
const { joiMessages } = require('../../common/joi.helpers');

/**
 * Caso de uso: Criar Usuário
 * @param {Pool} connector
 */
function CreateUserUseCase(connector) {
  /**
   * Cria um novo usuário
   * @param {CreateUserRequest} request payload de entrada
   * @returns {Promise<CreateUserResponse>} payload de saída
   */
  this.handleAsync = async function (request) {
    const repository = new UserRepository(connector);
    const response = new CreateUserResponse();
    request.name = request.name?.replace(/-/g, ""); // remove os hífens
    const { error } = validate(request);

    if (error) {
      response.error = true;
      response.message = error.message;
      console.error("[VALIDATION ERROR]", response);
      return response;
    }

    const userModel = new UserModel(request);
    userModel.password = await passwordService.hashAsync(request.password);

    const user = await repository.createUser(userModel);

    const operator = await repository.getUserByUsername(request.operator);
    await repository.createUserHistory(new UserHistoryModel({
      operatorId: operator.id,
      userId: user.id,
      event: request.eventName,
      data: user
    }));

    response.user = new CreateUserResponseUser(user);

    return response;
  };

  /**
   * Valida a requisição
   * @param {CreateUserRequest} request payload de entrada
   */
  function validate(request) {
    const schema = Joi.object({
      eventName: Joi.string().valid(
        UserHistoryModel.EVENT_USER_CREATED,
        UserHistoryModel.EVENT_USER_SIGNED_UP
      ).required().label("Nome do Evento"),
      operator: Joi.string().min(3).max(32).required().label("Usuário operador"),
      name: Joi.string().min(2).max(32).required().label('Nome do usuário'),
      email: Joi.string().email().max(128).required().label('Email'),
      username: Joi.string().min(3).max(32).required().label('Nome de usuário (login)'),
      password: Joi.string().min(8).max(128)
        .regex(/[0-9]+/, { name: 'ao menos um número' }) // Ao menos um número em qualquer posição
        .regex(/[a-z]+/, { name: 'ao menos uma letra minúscula' }) // Ao menos uma letra minúscula em qualquer posição
        .regex(/[A-Z]+/, { name: 'ao menos uma leta maiúscula' }) // Ao menos uma letra maiúscula em qualquer posição
        .required().label('Senha'),
      avatar: Joi.string().uri().optional().label('Url da Imagem'),
      cover: Joi.string().uri().optional().label('Url da Capa'),
    }).required().label('Requisição').messages(joiMessages);

    return schema.validate(request);
  }
}

/**
 * Requisição do caso de uso
 * @param {Object} options
 * @param {string} options.eventName Nome do evento registrado no histórico. Evento padrão: UserHistoryModel.EVENT_USER_CREATED
 * @param {string} options.operator Login do usuário executor do caso de uso
 * @param {string} options.name Nome do novo usuário
 * @param {string} options.email Email do novo usuário
 * @param {string} options.username Nome de usuário (login) do novo usuário
 * @param {string} options.password Senha do novo usuário
 * @param {string} options.avatar Endereço URL da imagem do novo usuário
 * @param {string} options.cover Endereço URL da capa do novo usuário
 */
function CreateUserRequest(options = {}) {
  this.eventName = options.eventName || UserHistoryModel.EVENT_USER_CREATED;
  this.operator = options.operator;
  this.name = options.name;
  this.email= options.email;
  this.username = options.username;
  this.password = options.password;
  this.avatar = options.avatar;
  this.cover = options.cover;
}

/**
 * Resposta do caso de uso
 */
function CreateUserResponse() {
  this.error = undefined;
  this.message = undefined;
  this.user = undefined;
}

/**
 * Objeto usado internamente na resposta
 * @param {UserModel} model Modelo de usuário
 */
function CreateUserResponseUser(model) {
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
  CreateUserUseCase,
  CreateUserRequest,
  CreateUserResponse,
};
