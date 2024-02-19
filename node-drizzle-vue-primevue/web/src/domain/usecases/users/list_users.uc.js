import Joi, { filtersSchema, sortingSchema, messages as joiMessages } from '@/shared/helpers/joi'

import { Pagination } from '@/domain/value_objects/pagination'
import { Sorting } from '@/domain/value_objects/sorting'
import { Filter } from '@/domain/value_objects/filter'
import { User } from '@/domain/entities/user'

/**
 * Caso de uso: Listar usuários
*/
export function ListUsersUseCase(api) {
  /**
   * Valida requisição
   * @param {ListUsersPayload} payload Parâmetros da requisição
   */
  function validate(payload) {
    const schema = Joi.object({
      pagination: Joi.object({
        page: Joi.number().min(0).required().label('Página atual'),
        size: Joi.number().positive().required().label('Tamanho da página'),
      }).required().label('Paginação'),
      sorting: sortingSchema.optional().label('Ordenação'),
      filters: Joi.object({
        id: filtersSchema.optional().label('Identificador'),
        name: filtersSchema.optional().label('Nome'),
        email: filtersSchema.optional().label('Email'),
        username: filtersSchema.optional().label('Nome de usuário'),
        otpEnabled: filtersSchema.optional().label('Autenticação'),
        active: filtersSchema.optional().label('Situação'),
      }).optional().label('Filtros'),
    }).required().label('Consulta').messages(joiMessages)

    return schema.validate(payload);
  }

  /**
   * Lista usuários
   * @param {ListUsersPayload} payload Parâmetros da requisição
   */
  this.handle = async function(payload = new ListUsersPayload()) {
    const { error } = validate(payload);
    
    if (error) {
      return {
        error: true,
        message: error.message
      };
    }

    try {
      const response = await api.get("/api/v1/users", {
        params: {
          page: payload.pagination.page,
          size: payload.pagination.size,
          sorting: payload.sorting,
          filters: payload.filters
        }
      })

      if (response?.error) {
        return {
          error: true,
          message: response.message
        }
      }

      return {
        data: response?.data?.users.map(user => new User({...user})) ?? [],
        pagination: {
          page: response?.data?.currentPage,
          size: response?.data?.pageSize,
          total: response?.data?.totalRows,
        }
      }
    } catch (error) {
      return {
        error: error,
        message: 'Não foi possível efetuar a consulta'
      };
    }
  }
}

/**
 * Parâmetros da requisição
 * @param {Object} options Parâmetros da requisição
 * @param {Pagination} options.pagination Dados da paginação
 * @param {Sorting[]} options.sorting Colunas ordenadas
 * @param {Object} options.filters Filtros
 * @param {Filter} options.filters.id Id do usuário
 * @param {Filter} options.filters.name Nome do usuário
 * @param {Filter} options.filters.email Email do usuário
 * @param {Filter} options.filters.username Login do usuário
 * @param {Filter} options.filters.active Situação do usuário
 * @param {Filter} options.filters.otpEnabled 2FA
 */
export function ListUsersPayload(options = {}) {
  this.pagination = options.pagination ?? {}
  this.sorting = options.sorting ?? []
  this.filters = options.filters ?? {}
}