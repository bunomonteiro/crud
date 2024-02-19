/**
 * Configuração de filtro
 * @param {Object} options Configuração
 * @param {Object} options.value Valor
 * @param {string} options.matchMode Modo de checagem
 * @param {string} options.operator Operador
 * @param {Object[]} options.constraints[] Restrições do filtro
 * @param {Object} options.constraints[].value Valor
 * @param {string} options.constraints[].matchMode Valor
 */
export function Filter(options = {}) {
  this.value = options.value
  this.matchMode = options.matchMode
  this.operator = options.operator
  this.constraints = options.constraints
}