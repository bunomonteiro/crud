const nodemailer = require("nodemailer");
const configurations = require('../../services/configurations/configuration.service')

/**
 * Serviço de envio de e-mail
 */
const EmailService = {
  /**
   * Envia email
   * @param {object} options Configuração da mensagem
   * @param {string[]} options.to Lista de endereços de destino
   * @param {string[]} options.cc Lista de endereços de destino CC
   * @param {string[]} options.bcc Lista de endereços de destino BCC
   * @param {string} options.subject Assunto do email
   * @param {string} options.text Versão do e-mail em texto plano
   * @param {string} options.html Versão do e-mail em HTML
   * @param {object[]} options.attachments Lista de anexos. Ver: https://nodemailer.com/message/attachments/
   */
  async sendAsync(options = {}) {
    if(!configurations.smtp.enabled) {
      console.info('SMTP disabled')
      return null
    }

    const transporter = nodemailer.createTransport({
      host: configurations.smtp.host,
      port: configurations.smtp.port,
      secure: configurations.smtp.secure,
      auth: {
        user: configurations.smtp.auth.user,
        pass: configurations.smtp.auth.pass,
      },
    });

    const message = {...options};
    message.from = configurations.smtp.from;

    return await transporter.sendMail(message);
  }
}

module.exports = EmailService;