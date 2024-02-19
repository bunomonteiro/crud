/**
 * Configuração de ordenação
 * @param {Object} options Configuração
 * @param {string} options.field Nome do campo
 * @param {number} options.order Ordem (-1, 0 ou 1)
 */
export function Sorting(options = {}) {
  this.field = options.field
  this.order = options?.order ?? 0
}