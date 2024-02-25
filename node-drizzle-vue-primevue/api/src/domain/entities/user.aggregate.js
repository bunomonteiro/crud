const { HistoryBaseModel } = require('./history_base')

/**
 * Modelo de consulta paginada
 * @param {Object} options Dados da consulta paginada
 * @param {Number} options.totalRows Quantidade de registros encontrados
 * @param {Number} options.currentPage Número da página atual (começa em 0)
 * @param {Number} options.pageSize Quantidade de registros por página
 * @param {Object[]} options.data Lista de registros da consulta
 */
function PaginatedQueryModel(options = {}) {
  this.totalRows = options.totalRows;
  this.currentPage = options.currentPage;
  this.pageSize = options.pageSize;
  this.data = options.data || [];
}

/**
 * Modelo de usuário
 * - Tabela: user
 * @param {Object} options Dados do usuário
 * @param {Number} options.id Identificador do usuário
 * @param {String} options.name Nome do usuário
 * @param {String} options.username Nome de usuário (login) do usuário
 * @param {String} options.email Email do usuário
 * @param {String} options.password Senha do usuário
 * @param {String} options.avatar URL da imagem de avatar do usuário
 * @param {String} options.cover URL da imagem de capa do usuário
 * @param {String} options.otpSecret Secredo do OTP
 * @param {String} options.otpUri URL do OTP
 * @param {Boolean} options.otpEnabled Indicador de ativação do OTP
 * @param {Boolean} options.otpVerified Indicador de verificação (se o usuário já fez a primeira validação após ativação)
 * @param {String} options.passwordRecoveryToken Token de solicitação de recuperação de senha
 * @param {Boolean} options.active Indicador do estado do usuário
 */
function UserModel(options = {}) {
  this.id = options.id;
  this.name = options.name;
  this.username = options.username?.toLowerCase()
  this.email = options.email?.toLowerCase()
  this.password = options.password;
  this.avatar = options.avatar;
  this.cover = options.cover;
  this.otpSecret = options.otpSecret;
  this.otpUri = options.otpUri;
  this.otpEnabled = options.otpEnabled;
  this.otpVerified = options.otpVerified;
  this.passwordRecoveryToken = options.passwordRecoveryToken;
  this.active = options.active;
}

/**
 * Modelo base do histórico de usuário
 * - Tabela: user_history
 */
class UserHistoryModel extends HistoryBaseModel {
  static EVENT_USER_CREATED = "user.created";
  static EVENT_USER_SIGNED_UP = "user.signed_up";
  static EVENT_USER_UPDATED = "user.updated";
  static EVENT_USER_PASSWORD_RECOVERY_REQUESTED = "user.password_recovery_requested";
  static EVENT_USER_PASSWORD_CHANGED = "user.password_changed";
  static EVENT_USER_LOGGED_IN = "user.logged_in";
  static EVENT_USER_LOGGED_IN_WITH_OTP = "user.logged_in_with_otp";
  static EVENT_USER_LOGGED_OUT = "user.logged_out";
  static EVENT_USER_OTP_REGISTERED = "user.otp_registered";
  static EVENT_USER_REQUESTED_OTP_URI = "user.requested_otp_uri";
  static EVENT_USER_OTP_VERIFIED = "user.otp_verified";
  static EVENT_USER_OTP_DISABLED = "user.otp_disabled";

  /**
   * Construtor do históricos
   * @param {Object} options Dados do histórico
   * @param {Number} options.id Identificador do histórico
   * @param {Number} options.operatorId Identificador do usuário criador do histórico
   * @param {UserModel} options.operator Usuário criador do histórico
   * @param {Date} options.createdAt Quando o histórico foi criada
   * @param {String} options.event Nome do evento
   * @param {Object} options.data Objeto serializado após a operação original
   * @param {Number} options.userId Identificador do usuário alvo
   * @param {UserModel} options.user Usuário alvo
   */
  constructor(options = {}) {
    super(options)
    this.userId = options.userId;
    this.user = options.user;
  }
}

module.exports = {
  PaginatedQueryModel,
  UserModel,
  UserHistoryModel,
};