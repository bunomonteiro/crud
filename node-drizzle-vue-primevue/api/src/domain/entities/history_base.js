/**
 * Modelo base dos históricos
 */
class HistoryBaseModel {
  /**
   * Construtor do históricos
   * @param {Object} options Dados do histórico
   * @param {Number} options.id Identificador do histórico
   * @param {Number} options.operatorId Identificador do usuário criador do histórico
   * @param {UserModel} options.operator Usuário criador do histórico
   * @param {Date} options.createdAt Quando o histórico foi criada
   * @param {String} options.event Nome do evento
   * @param {Object} options.data Objeto serializado após a operação original
   */
  constructor(options = {}) {
    this.id = options.id;
    this.operatorId = options.operatorId;
    this.operator = options.operator;
    this.createdAt = options.createdAt;
    this.event = options.event;
    this.data = options.data;
  }
}

module.exports = {
  HistoryBaseModel
};