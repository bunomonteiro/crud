const { joiMessages, jsonPatchSchema } = require('../../../shared/utils/validations')
const { UserHistoryModel, UserModel } = require("../../entities/user.aggregate")

/**
 * Caso de uso: Atualisa usuário
 * @param {Object} libs Bibliotecas
 * @param {import('joi')} libs.Joi
 * @param {import('fast-json-patch')} libs.jsonPatch
 * @param {import("../../../adapters/database/repositories/user.repository")} repository Repositório de usuários
 */
function UpdateUserUseCase(libs, repository) {
  /**
   * Atualiza um usuário
   * @param { UpdateUserRequest } request payload de entrada
   * @returns {Promise<UpdateUserResponse>} payload de saída
   */
  this.handleAsync = async function (request) {
    const response = new UpdateUserResponse()
    const { error } = validate(request)

    if (error) {
      response.error = true;
      response.message = error.message;
      return response;
    }

    let user;
    if (request.id) {
      user = await repository.getUserById(request.id)
    } else {
      user = await repository.getUserByUsername(request.username)
    }

    // WARNING: Evitar alterar as seguintes propriedades neste caso de uso
    const safeProperties = ['/id', '/username', '/passwordrecoverytoken', '/otpsecret', '/otpuri', '/otpenabled', '/otpverified'];
    const safePatches = request.patches.filter((op) => !safeProperties.includes(op.path?.toLowerCase()))
    let updatedUser = libs.jsonPatch.applyPatch(user, safePatches, true, false).newDocument;

    const { error: validationError } = validateUser(updatedUser)

    if(validationError) {
      response.error = true;
      response.message = validationError.message;
      return response;
    }

    if(libs.jsonPatch.compare(user, updatedUser).length) {
      updatedUser = await repository.updateUser(updatedUser)
  
      const operator = await repository.getUserByUsername(request.operator)
      await repository.createUserHistory(new UserHistoryModel({
        operatorId: operator.id,
        userId: user.id,
        event: request.eventName,
        data: updatedUser
      }))
    } else {
      updatedUser = user
    }

    response.user = new UpdateUserResponseUser(updatedUser)

    return response;
  };

  /**
   * Valida a requisição
   * @param {UpdateUserRequest} request payload de entrada
   */
  function validate(request) {
    const schema = libs.Joi.object({
      operator: libs.Joi.string().min(3).max(32).required().label("Usuário operador"),
      id: libs.Joi.number().positive().label('Identificador do usuário'),
      username: libs.Joi.string().min(3).max(32).label('Nome de usuário (login)'),
      patches: jsonPatchSchema.required().label("Atualizações"),
      eventName: libs.Joi.string().valid(
        UserHistoryModel.EVENT_USER_UPDATED,
        UserHistoryModel.EVENT_USER_PASSWORD_CHANGED
      ).required().label("Nome do Evento"),
    }).or('id', 'username').required().label('Requisição').messages(joiMessages)

    return schema.validate(request)
  }

  /**
   * Valida o usuário atualizado
   * @param {UserModel} user 
   */
  function validateUser(user) {
    const schema = libs.Joi.object({
      name: libs.Joi.string().min(2).max(32).required().label('Nome do usuário'),
      email: libs.Joi.string().email().max(128).required().label('Email'),
      avatar: libs.Joi.string().uri().allow(null).optional().label('Url da Imagem'),
      cover: libs.Joi.string().uri().allow(null).optional().label('Url da Capa'),
    })

    return schema.validate(user, { allowUnknown: true })
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

const UpdateUserUseCaseName = 'uc.update.user'
module.exports = {
  UpdateUserUseCase,
  UpdateUserRequest,
  UpdateUserResponse,
  UpdateUserUseCaseName
};
