const { Pool } = require("pg");
const Joi = require('joi');

const UserRepository = require("../../data/repositories/user.repository");
const { joiMessages, filtersSchema, sortingSchema } = require('../../common/joi.helpers');
const { UserHistoryModel } = require("../../data/models");

/**
 * Caso de uso: Listar os históricos dos usuários
 * @param {Pool} connector 
 */
function ListUserHistoriesUseCase(connector) {
  /**
   * Lista os históricos dos usuários
   * @param {ListUserHistoriesRequest} request payload de entrada
   * @returns {Promise<ListUserHistoriesResponse>} payload de saída
   */
  this.handleAsync = async function (request) {
    const repository = new UserRepository(connector);
    const response = new ListUserHistoriesResponse();
    const { error } = validate(request);

    if (error) {
      response.error = true;
      response.message = error.message;
      return response;
    }

    const options = { sorting: request.sorting, filters: request.filters }
    const pagination = await repository.listAllUserHistories(request.page, request.size, options);
    response.totalRows = pagination.totalRows;
    response.pageSize = pagination.pageSize;
    response.currentPage = pagination.currentPage;
    response.userHistories = pagination.data.map((history) => new ListUserHistoriesResponseUserHistory(history));

    return response;
  };

  /**
   * Valida a requisição
   * @param {ListUserHistoriesRequest} request payload de entrada
   */
  function validate(request) {
    const schema = Joi.object({
      size: Joi.number().positive().required().label('Quantidade'),
      page: Joi.number().min(0).required().label('Página'),
      filters: Joi.object({
        createdAt: filtersSchema.optional().label('Data'),
        event: filtersSchema.optional().label('Evento'),
        "operator.name": filtersSchema.optional().label('Operador'),
        "user.name": filtersSchema.optional().label('Usuário'),
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
function ListUserHistoriesRequest(options = {}) {
  this.page = parseInt(options.page) || 0;
  this.size = parseInt(options.size) || 10;
  this.sorting = options.sorting ?? [{column: 'createdAt'}];
  this.filters = options.filters;
}

/**
 * Resposta do caso de uso
 */
function ListUserHistoriesResponse() {
  this.error = undefined;
  this.message = undefined;
  this.totalRows = undefined;
  this.currentPage = undefined;
  this.pageSize = undefined;
  this.userHistories = undefined;
}

/**
 * Objeto usado internamente na resposta
 * @param {UserHistoryModel} model Modelo de histórico de usuário
 */
function ListUserHistoriesResponseUserHistory(model) {
  this.id = model.id;
  this.userId = model.userId;
  this.user = {
    ...model.user, 
    email: undefined,
    cover: undefined,
    password: undefined,
    otpSecret: undefined,
    otpUri: undefined,
    otpEnabled: undefined,
    otpVerified: undefined,
    passwordRecoveryToken: undefined,
    active: undefined,
  };
  this.operatorId = model.operatorId;
  this.operator = {
    ...model.operator,
    email: undefined,
    cover: undefined,
    password: undefined,
    otpSecret: undefined,
    otpUri: undefined,
    otpEnabled: undefined,
    otpVerified: undefined,
    passwordRecoveryToken: undefined,
    active: undefined,
  };
  this.createdAt = model.createdAt;
  this.event = model.event;
}

module.exports = {
  ListUserHistoriesUseCase,
  ListUserHistoriesRequest,
  ListUserHistoriesResponse,
};
