const { Pool } = require("pg");
const Joi = require('joi');
const jsonPatch = require('fast-json-patch');

const UserRepository = require("../../data/repositories/user.repository");
const { joiMessages, jsonPatchSchema } = require('../../common/joi.helpers');
const { UserHistoryModel, UserModel } = require("../../data/models");

/**
 * Caso de uso: Atualisa usuário
 * @param {Pool} connector
 */
function UpdateUserUseCase(connector) {
  /**
   * Atualiza um usuário
   * @param { UpdateUserRequest } request payload de entrada
   * @returns {Promise<UpdateUserResponse>} payload de saída
   */
  this.handleAsync = async function (request) {
    const repository = new UserRepository(connector);
    const response = new UpdateUserResponse();
    const { error } = validate(request);

    if (error) {
      response.error = true;
      response.message = error.message;
      console.error("[VALIDATION ERROR]", response);
      return response;
    }

    let user;
    if (request.id) {
      user = await repository.getUserById(request.id);
    } else {
      user = await repository.getUserByUsername(request.username);
    }

    // WARNING: Evitar alterar as seguintes propriedades neste caso de uso
    const safeProperties = ['/id', '/username', '/passwordrecoverytoken', '/otpsecret', '/otpuri', '/otpenabled', '/otpverified'];
    const safePatches = request.patches.filter((op) => !safeProperties.includes(op.path?.toLowerCase()))
    let updatedUser = jsonPatch.applyPatch(user, safePatches, true, false).newDocument;

    const { error: validationError } = validateUser(updatedUser)

    if(validationError) {
      response.error = true;
      response.message = validationError.message;
      console.error("[VALIDATION ERROR]", response);
      return response;
    }

    if(jsonPatch.compare(user, updatedUser).length) {
      updatedUser = await repository.updateUser(updatedUser);
  
      const operator = await repository.getUserByUsername(request.operator);
      await repository.createUserHistory(new UserHistoryModel({
        operatorId: operator.id,
        userId: user.id,
        event: request.eventName,
        data: updatedUser
      }));
    }

    response.user = new UpdateUserResponseUser(updatedUser);

    return response;
  };

  /**
   * Valida a requisição
   * @param {UpdateUserRequest} request payload de entrada
   */
  function validate(request) {
    const schema = Joi.object({
      operator: Joi.string().min(3).max(32).required().label("Usuário operador"),
      id: Joi.number().positive().label('Nome do usuário'),
      username: Joi.string().min(3).max(32).label('Nome de usuário (login)'),
      patches: jsonPatchSchema.required().label("Atualizações"),
      eventName: Joi.string().valid(
        UserHistoryModel.EVENT_USER_UPDATED,
        UserHistoryModel.EVENT_USER_PASSWORD_CHANGED
      ).required().label("Nome do Evento"),
    }).or('id', 'username').required().label('Requisição').messages(joiMessages)

    return schema.validate(request);
  }

  /**
   * Valida o usuário atualizado
   * @param {UserModel} user 
   */
  function validateUser(user) {
    const schema = Joi.object({
      name: Joi.string().min(2).max(32).required().label('Nome do usuário'),
      email: Joi.string().email().max(128).required().label('Email'),
      avatar: Joi.string().uri().allow(null).optional().label('Url da Imagem'),
      cover: Joi.string().uri().allow(null).optional().label('Url da Capa'),
    })

    return schema.validate(user, { allowUnknown: true });
  }
}

/**
 * Requisição do caso de uso
 * @param {Object} options
 * @param {string} options.operator Login do usuário executor do caso de uso
 * @param {number} options.id Identificador do usuário alvo
 * @param {string} options.username Nome de usuário (login) do usuário alvo
 * @param {object[]} options.patches Json Patch com as atualizações parciais do usuário
 * @param {string} options.eventName Nome do evento que deve ser registrado. Por padrão: UserHistoryModel.EVENT_USER_UPDATED
 */
function UpdateUserRequest(options = {}) {
  this.operator = options.operator;
  this.id = options.id;
  this.username = options.username;
  this.patches = options.patches;
  this.eventName = options.eventName || UserHistoryModel.EVENT_USER_UPDATED;
}

/**
 * Resposta do caso de uso
 */
function UpdateUserResponse() {
  this.error = undefined;
  this.message = undefined;
  this.user = undefined;
}

/**
 * Objeto usado internamente na resposta
 * @param {UserModel} model Modelo de usuário
 */
function UpdateUserResponseUser(model) {
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
  UpdateUserUseCase,
  UpdateUserRequest,
  UpdateUserResponse,
};
