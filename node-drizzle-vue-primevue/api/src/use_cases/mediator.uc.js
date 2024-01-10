// #region imports
const { getConnectionPool } = require("../data/database");

const { ChangePasswordUseCase } = require("./auth/change_password.uc");
const { DoLoginUseCase } = require("./auth/do_login.uc");
const { DisableOtpUseCase } = require("./auth/otp/disable_otp.uc");
const { FinishOtpRegistrationUseCase } = require("./auth/otp/finish_otp_registration.uc");
const { GetOtpUriUseCase } = require("./auth/otp/get_otp_uri.uc");
const { StartOtpRegistrationUseCase } = require("./auth/otp/start_otp_registration.uc");
const { ValidateOtpUseCase } = require("./auth/otp/validate_otp.uc");
const { RequestPasswordRecoveryUseCase } = require("./auth/request_password_recovery.uc");
const { CreateUserUseCase } = require("./users/create_user.uc");
const { GetUserUseCase } = require("./users/get_user.uc");
const { ListUserHistoriesUseCase } = require("./users/list_user_histories.uc");
const { ListUsersUseCase } = require("./users/list_users.uc");
const { UpdateUserUseCase } = require("./users/update_user.uc");
// #endregion imports

const UseCases = {
  // #region AUTH
  AUTH__CHANGE_PASSWORD: 'uc.chage_password',
  AUTH__DO_LOGIN: 'uc.do_login',
  AUTH__REQUEST_PASSWORD_RECOVERY: 'uc.reques_password_recovery',
  AUTH__DISABLE_OTP: 'uc.disable_otp',
  AUTH__FINISH_OTP_REGISTRATION: 'uc.finish_otp_registration',
  AUTH__START_OTP_REGISTRATION: 'uc.start_otp_registration',
  AUTH__VALIDATE_OTP: 'uc.validate_otp',
  AUTH__GET_OTP_URI: 'uc.get_otp_uri',
  // #endregion AUTH
  
  // #region USERS
  USERS__CREATE_USER: 'uc.create_user',
  USERS__GET_USER: 'uc.get_user',
  USERS__LIST_USERS: 'uc.list_users',
  USERS__LIST_USER_HISTORIES: 'uc.list_user_histories',
  USERS__UPDATE_USER: 'uc.update_user',
  // #endregion USERS
}

/**
 * Mediador de casos de uso
 */
const Mediator = function() {
  let _useSases = {};

  function register() {
    // #region AUTH
    _useSases[UseCases.AUTH__CHANGE_PASSWORD] = () => new ChangePasswordUseCase(getConnectionPool());
    _useSases[UseCases.AUTH__DO_LOGIN] = () => new DoLoginUseCase(getConnectionPool());
    _useSases[UseCases.AUTH__REQUEST_PASSWORD_RECOVERY] = () => new RequestPasswordRecoveryUseCase(getConnectionPool());
    _useSases[UseCases.AUTH__DISABLE_OTP] = () => new DisableOtpUseCase(getConnectionPool());
    _useSases[UseCases.AUTH__FINISH_OTP_REGISTRATION] = () => new FinishOtpRegistrationUseCase(getConnectionPool());
    _useSases[UseCases.AUTH__START_OTP_REGISTRATION] = () => new StartOtpRegistrationUseCase(getConnectionPool());
    _useSases[UseCases.AUTH__VALIDATE_OTP] = () => new ValidateOtpUseCase(getConnectionPool());
    _useSases[UseCases.AUTH__GET_OTP_URI] = () => new GetOtpUriUseCase(getConnectionPool());
    // #endregion AUTH
    
    // #region USERS
    _useSases[UseCases.USERS__CREATE_USER] = () => new CreateUserUseCase(getConnectionPool());
    _useSases[UseCases.USERS__GET_USER] = () => new GetUserUseCase(getConnectionPool());
    _useSases[UseCases.USERS__LIST_USERS] = () => new ListUsersUseCase(getConnectionPool());
    _useSases[UseCases.USERS__LIST_USER_HISTORIES] = () => new ListUserHistoriesUseCase(getConnectionPool());
    _useSases[UseCases.USERS__UPDATE_USER] = () => new UpdateUserUseCase(getConnectionPool());
    // #endregion USERS
  }

  /**
   * Executa um caso de uso pré-registrado
   * @param {string} useCaseName Nome do caso de uso
   * @param {object} request Requisição específica do caso de uso
   * @returns {object} Resposta do caso de uso
   */
  this.handleAsync = async function(useCaseName, request) {
    const useCase = _useSases[useCaseName];

    if(useCase) {
      return await useCase().handleAsync(request);
    }

    return {
      error: true,
      message: "Operação não registrada"
    };
  }

  register();
}

/**
 * Singleton do mediador de casos de uso
 * @returns {Mediator} Mediador de casos de uso
 */
const getMediator = function() {
  if (global.useCasesMediator) {
    return global.useCasesMediator;
  }

  global.useCasesMediator = new Mediator();
  return global.useCasesMediator;
}

module.exports = {
  UseCases,
  getMediator,
};