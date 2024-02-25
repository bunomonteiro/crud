const nodemailer = require("nodemailer")

/**
 * Serviço de envio de e-mail
 */
function EmailService(){
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
  this.sendAsync = async function(options = {}) {
    if(!global.configurations.smtp.enabled) {
      console.info('SMTP disabled')
      return null
    }

    const transporter = nodemailer.createTransport({
      host: global.configurations.smtp.host,
      port: global.configurations.smtp.port,
      secure: global.configurations.smtp.secure,
      auth: {
        user: global.configurations.smtp.auth.user,
        pass: global.configurations.smtp.auth.pass,
      },
    })

    const message = {...options};
    message.from = global.configurations.smtp.from;

    return await transporter.sendMail(message)
  }
}

module.exports = EmailService;