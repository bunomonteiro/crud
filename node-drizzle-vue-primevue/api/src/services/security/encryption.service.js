const crypto = require("crypto");
const configurations = require('../../services/configurations/configuration.service')

const encryptionKey = crypto
  .createHash('sha512')
  .update(configurations.api.crypt.key)
  .digest('hex')
  .substring(0, 32);

const encryptionIV = crypto
  .createHash('sha512')
  .update(configurations.api.crypt.iv)
  .digest('hex')
  .substring(0, 16);

/**
 * Serviço de criptografia e descriptografia
 */
const EncryptionService = {
  /**
   * Criptografar
   * @param {string} data Dado a ser criptografado
   */
  encrypt(data) {
    const cipher = crypto.createCipheriv(configurations.api.crypt.method, encryptionKey, encryptionIV);
    
    return Buffer.from(
      cipher.update(data, 'utf8', 'hex') + cipher.final('hex')
    ).toString('base64') // Encrypts data and converts to hex and base64
  },

  /**
   * Descriptografar
   * @param {string} data Dado a ser descriptografado
   */
  decrypt(encryptedData) {
    const buff = Buffer.from(encryptedData, 'base64');    
    const decipher = crypto.createDecipheriv(configurations.api.crypt.method, encryptionKey, encryptionIV);
    
    return (
      decipher.update(buff.toString('utf8'), 'hex', 'utf8') +
      decipher.final('utf8')
    ) // Decrypts data and converts to utf8
  }
}

module.exports = EncryptionService;
