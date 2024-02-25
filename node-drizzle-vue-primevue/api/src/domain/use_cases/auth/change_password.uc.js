
const templateCompiler = require('../../../shared/utils/text/template.service')
const { joiMessages } = require('../../../shared/utils/validations')
const { UserHistoryModel } = require("../../../domain/entities/user.aggregate")

/**
 * Caso de uso: Mudar senha
 * @param {Object} libs Bibliotecas
 * @param {import('path')} libs.path
 * @param {import('joi')} libs.Joi
 * @param {import('dayjs')} libs.dayjs
 * @param {import('../../../adapters/security/encryption.service')} cryptService Repositório de usuários
 * @param {import('../../../adapters/security/password.service')} passwordService Repositório de usuários
 * @param {import('../../../adapters/network/email.service')} emailService Repositório de usuários
 * @param {import("../../../../adapters/database/repositories/user.repository")} repository Repositório de usuários
 */
function ChangePasswordUseCase(libs, repository, cryptService, passwordService, emailService) {
  /**
   * Muda a senha
   * @param {ChangePasswordRequest} request payload de entrada
   * @returns {Promise<ChangePasswordResponse>} payload de saída
   */
  this.handleAsync = async function (request) {
    const response = new ChangePasswordResponse()
    const { error } = validate(request)

    if (error) {
      response.error = true;
      response.message = error.message;
      return response;
    }

    const token = JSON.parse(cryptService.decrypt(request.token))

    if(libs.dayjs.utc().diff(libs.dayjs.utc(token.moment)) >= 0) {
      response.error = true;
      response.message = "Token de recuperação de senha inválido";
      return response;
    }

    let user = await repository.getUserByUsername(token.username)

    if(!user || user.passwordRecoveryToken !== request.token) {
      response.error = true;
      response.message = "Token de recuperação de senha inválido";
      return response;
    }

    user.passwordRecoveryToken = null;
    user.password = await passwordService.hashAsync(request.password)    
    await repository.updateUser(user)    

    await repository.createUserHistory(new UserHistoryModel({
      operatorId: user.id,
      userId: user.id,
      event: UserHistoryModel.EVENT_USER_PASSWORD_CHANGED,
      data: user
    }))

    await emailService.sendAsync({
      to: user.email,
      subject: "Senha Alterada",
      html: templateCompiler.compileFromPath(libs.path.resolve(__dirname, "../../../../public/templates/emails/password_changed.html"), {
        user_name: user.name,
        app_name: global.configurations.api.name,
        app_url: global.configurations.app.uri,
        address_line1: "123123, Endereço linha 1",
        address_line2: "Endereço, Linha - 2",
      })
    })

    return response;
  };

  /**
   * Valida a requisição
   * @param {ChangePasswordRequest} request payload de entrada
   */
  function validate(request) {
    const schema = libs.Joi.object({
      token: libs.Joi.string().required().label('Token'),
      password: libs.Joi.string().min(8).max(128)
        .regex(/[0-9]+/, { name: 'ao menos um número' }) // Ao menos um número em qualquer posição
        .regex(/[a-z]+/, { name: 'ao menos uma letra minúscula' }) // Ao menos uma letra minúscula em qualquer posição
        .regex(/[A-Z]+/, { name: 'ao menos uma leta maiúscula' }) // Ao menos uma letra maiúscula em qualquer posição
        .required().label('Senha'),
    }).required().label('Requisição').messages(joiMessages)

    return schema.validate(request)
  }
}

/**
 * Requisição do caso de uso
 * @param {Object} options
 * @param {string} options.token Token de solicitação de recuperação de senha
 * @param {string} options.password Nova senha do usuário
 */
function ChangePasswordRequest(options = {}) {
  this.token = options.token;
  this.password = options.password;
}

/**
 * Resposta do caso de uso
 */
function ChangePasswordResponse() {
  this.error = undefined;
  this.message = undefined;
}

const ChangePasswordUseCaseName = 'uc.change.password'
module.exports = {
  ChangePasswordUseCase,
  ChangePasswordRequest,
  ChangePasswordResponse,
  ChangePasswordUseCaseName
};
