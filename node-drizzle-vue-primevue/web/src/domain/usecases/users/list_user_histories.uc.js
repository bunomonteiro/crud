import Joi, { filtersSchema, sortingSchema, messages as joiMessages } from '@/shared/helpers/joi'

import { Pagination } from '@/domain/value_objects/pagination'
import { Sorting } from '@/domain/value_objects/sorting'
import { Filter } from '@/domain/value_objects/filter'
import { UserHistory } from '@/domain/entities/user'

/**
 * Caso de uso: Listar usuários
*/
export function ListUserHistoriesUseCase(api) {
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
        createdAt: filtersSchema.optional().label('Data'),
        event: filtersSchema.optional().label('Evento'),
        "operator.name": filtersSchema.optional().label('Operador'),
        "user.name": filtersSchema.optional().label('Usuário'),
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
      const response = await api.get("/api/v1/user-histories", { 
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
        data: response?.data?.userHistories?.map(history => new UserHistory({...history})) ?? [],
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
 * @param {Filter} options.filters.user.name Nome do usuário alvo
 * @param {Filter} options.filters.event Nome do evento
 * @param {Filter} options.filters.operator.name Nome do usuário operador
 * @param {Filter} options.filters.createdAt Data do registro
 */
export function ListUserHistoriesPayload(options = {}) {
  this.pagination = options.pagination ?? {}
  this.sorting = options.sorting ?? []
  this.filters = options.filters ?? {}
}