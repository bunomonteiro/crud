/**
 * Modelo de usuário
 * @param {Object} options Dados do usuário
 * @param {number} options.id Identificador do usuário
 * @param {string} options.name Nome do usuário
 * @param {string} options.username Nome de usuário (login) do usuário
 * @param {string} options.email Email do usuário
 * @param {string} options.password Senha do usuário
 * @param {string} options.avatar URL da imagem de avatar do usuário
 * @param {string} options.cover URL da imagem de capa do usuário
 * @param {boolean} options.otpEnabled Indicador de ativação do OTP
 * @param {boolean} options.otpVerified Indicador de verificação (se o usuário já fez a primeira validação após ativação)
 * @param {boolean} options.active Indicador do estado do usuário
 */
export function User(options = {}) {
  this.id = options.id
  this.name = options.name
  this.username = options.username
  this.email = options.email
  this.password = options.password
  this.avatar = options.avatar ?? '/public/images/unknown user_avatar.png'
  this.cover = options.cover
  this.otpEnabled = options.otpEnabled
  this.otpVerified = options.otpVerified
  this.active = options.active
}

/**
 * Histórico de usuário
 * @param {Object} options Dados do histórico
 * @param {number} options.id Identificador do histórico
 * @param {number} options.operatorId Identificador do usuário criador do histórico
 * @param {User} options.operator Usuário criador do histórico
 * @param {number} options.userId Identificador do usuário alvo
 * @param {User} options.user Usuário alvo
 * @param {string} options.event Nome do evento
 * @param {Date} options.createdAt Quando o histórico foi criada
 * @param {Object} options.data Objeto serializado após a operação original
 */
export function UserHistory(options = {}) {
  this.id = options.id
  this.operatorId = options.operatorId
  this.operator = options.operator ? new User(options.operator) : null
  this.userId = options.userId
  this.user = options.user ? new User(options.user) : null
  this.event = options.event
  this.createdAt = options.createdAt
  this.data = options.data
}