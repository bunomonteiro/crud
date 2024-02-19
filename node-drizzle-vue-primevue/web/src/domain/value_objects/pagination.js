/**
 * Paginação
 * @param {Object} options Dados da paginação
 * @param {number} options.page Página atual
 * @param {number} options.size Tamanho da página
 * @param {number} options.total Total de registros encontrados
 */
export function Pagination(options = {}) {
  this.page = options.page
  this.size = options.size
  this.total = options.total
}