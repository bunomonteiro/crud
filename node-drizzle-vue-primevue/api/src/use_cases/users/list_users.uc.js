const { Pool } = require("pg");
const Joi = require('joi');

const UserRepository = require("../../data/repositories/user.repository");
const { joiMessages, sortingSchema, filtersSchema } = require('../../common/joi.helpers');
const { UserModel } = require("../../data/models");

/**
 * Caso de uso: Listar usuários
 * @param {Pool} connector 
 */
function ListUsersUseCase(connector) {
  /**
   * Lista os usuários
   * @param {ListUsersRequest} request payload de entrada
   * @returns {Promise<ListUsersResponse>} payload de saída
   */
  this.handleAsync = async function (request) {
    const repository = new UserRepository(connector);
    const response = new ListUsersResponse();
    const { error } = validate(request);

    if (error) {
      response.error = true;
      response.message = error.message;
      return response;
    }

    const options = { sorting: request.sorting, filters: request.filters }
    const pagination = await repository.listAllUsers(request.page, request.size, options);
    response.totalRows = pagination.totalRows;
    response.pageSize = pagination.pageSize;
    response.currentPage = pagination.currentPage;
    response.users = pagination.data.map((user) => new ListUsersResponseUser(user));

    return response;
  };

  /**
   * Valida a requisição
   * @param {ListUsersRequest} request payload de entrada
   */
  function validate(request) {
    const schema = Joi.object({
      size: Joi.number().positive().label('Quantidade').required(),
      page: Joi.number().min(0).label('Página').required(),
      filters: Joi.object({
        id: filtersSchema.optional().label('Identificador'),
        name: filtersSchema.optional().label('Nome'),
        email: filtersSchema.optional().label('Email'),
        username: filtersSchema.optional().label('Nome de usuário'),
        otpEnabled: filtersSchema.optional().label('Autenticação'),
        active: filtersSchema.optional().label('Situação'),
      }).optional().label('Filtros'),
      sorting: sortingSchema.optional().label('Ordenação')
    }).required().label('Requisição').messages(joiMessages)

    return schema.validate(request);
  }
}

/**
 * Requisição do caso de uso
 * @param {Object} options
 * @param {Number} options.page Qual a página deve trazer
 * @param {Number} options.size Qual o tamanho da página (quantidade de registros)
 * @param {string[]} options.sorting Colunas a serem ordenadas
 * @param {Object} options.filters Filtros da consula
 */
function ListUsersRequest(options = {}) {
  this.page = parseInt(options.page) || 0;
  this.size = parseInt(options.size) || 10;
  this.sorting = options.sorting ?? [{column: 'createdAt'}];
  this.filters = options.filters;
}

/**
 * Resposta do caso de uso
 */
function ListUsersResponse() {
  this.error = undefined;
  this.message = undefined;
  this.totalRows = undefined;
  this.currentPage = undefined;
  this.pageSize = undefined;
  this.users = undefined;
}

/**
 * Objeto usado internamente na resposta
 * @param {UserModel} model Modelo de usuário
 */
function ListUsersResponseUser(model) {
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
  ListUsersUseCase,
  ListUsersRequest,
  ListUsersResponse,
};
