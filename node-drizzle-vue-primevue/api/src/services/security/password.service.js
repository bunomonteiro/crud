const bcrypt = require("bcrypt");
const configurations = require('../../services/configurations/configuration.service')

/**
 * Serviço de senha.
 * Encapsula as operações básicas de senha.
 */
const PasswordService = {
  /**
   * Gera hash de um texto (senha) informado
   * @param {string} password Senha que deseja gerar o hash
   * @returns Hash da senha informada
   */
  async hashAsync(password) {
    const salt = await bcrypt.genSalt(configurations.api.auth.passwordSaltRounds);
    return await bcrypt.hash(password, salt);
  },
  /**
   * Compara se a senha informada é compatível com o hash informado
   * @param {string} password Senha aberta
   * @param {string} hash Hash a ser comparado
   */
  async compareAsync(password, hash) {
    return await bcrypt.compare(password, hash);
  }
}

module.exports = PasswordService