const bcrypt = require("bcrypt")

/**
 * Serviço de senha.
 * Encapsula as operações básicas de senha.
 */
function PasswordService() {
  /**
   * Gera hash de um texto (senha) informado
   * @param {string} password Senha que deseja gerar o hash
   * @returns Hash da senha informada
   */
  this.hashAsync = async function(password) {
    const salt = await bcrypt.genSalt(global.configurations.api.auth.passwordSaltRounds)
    return await bcrypt.hash(password, salt)
  },
  /**
   * Compara se a senha informada é compatível com o hash informado
   * @param {string} password Senha aberta
   * @param {string} hash Hash a ser comparado
   */
  this.compareAsync = async function(password, hash) {
    return await bcrypt.compare(password, hash)
  }
}

module.exports = PasswordService