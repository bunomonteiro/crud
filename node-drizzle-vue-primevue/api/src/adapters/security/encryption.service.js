const crypto = require("crypto")

/**
 * Serviço de criptografia e descriptografia
 */
function EncryptionService() {
  const _encryptionKey = crypto
    .createHash('sha512')
    .update(global.configurations.api.crypt.key)
    .digest('hex')
    .substring(0, 32)

  const _encryptionIV = crypto
    .createHash('sha512')
    .update(global.configurations.api.crypt.iv)
    .digest('hex')
    .substring(0, 16)

  /**
   * Criptografar
   * @param {string} data Dado a ser criptografado
   */
  this.encrypt = function(data) {
    const cipher = crypto.createCipheriv(global.configurations.api.crypt.method, _encryptionKey, _encryptionIV)
    
    return Buffer.from(
      cipher.update(data, 'utf8', 'hex') + cipher.final('hex')
    ).toString('base64') // Encrypts data and converts to hex and base64
  },

  /**
   * Descriptografar
   * @param {string} data Dado a ser descriptografado
   */
  this.decrypt = function(encryptedData) {
    const buff = Buffer.from(encryptedData, 'base64')    
    const decipher = crypto.createDecipheriv(global.configurations.api.crypt.method, _encryptionKey, _encryptionIV)
    
    return (
      decipher.update(buff.toString('utf8'), 'hex', 'utf8') +
      decipher.final('utf8')
    ) // Decrypts data and converts to utf8
  }
}

module.exports = EncryptionService;
