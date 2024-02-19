/**
 * JsonPatch
 * @param {Object} options Parâmetros da atualização
 * @param {string} options.op Operação (add, remove, replace, move, copy, test)
 * @param {string} options.path Caminho absoluto da propriedade alvo
 * @param {string} options.from Caminho original da propriedade (usado apenas com as operações 'move' e 'copy')
 * @param {string} options.value Novo valor
 */
export function Patch(options = {}) {
  this.op = options.op
  this.path = options.path
  this.from = options.from
  this.value = options.value
}