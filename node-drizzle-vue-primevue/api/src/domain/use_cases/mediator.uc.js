/**
 * Mediador de casos de uso
 */
const Mediator = function() {
  let _useSases = {};

  this.register = function(name, implementation) {
    _useSases[name] = implementation
  }

  /**
   * Executa um caso de uso pré-registrado
   * @param {string} useCaseName Nome do caso de uso
   * @param {object} request Requisição específica do caso de uso
   * @returns {object} Resposta do caso de uso
   */
  this.handleAsync = async function(useCaseName, request) {
    const useCase = _useSases[useCaseName];

    if(useCase) {
      return await useCase().handleAsync(request)
    }

    return {
      error: true,
      message: "Operação não registrada"
    };
  }
}

/**
 * Singleton do mediador de casos de uso
 * @returns {Mediator} Mediador de casos de uso
 */
const getMediator = function() {
  if (global.useCasesMediator) {
    return global.useCasesMediator;
  }

  global.useCasesMediator = new Mediator()
  return global.useCasesMediator;
}

module.exports = {
  getMediator
};