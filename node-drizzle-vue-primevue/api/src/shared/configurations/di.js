// Native
const path = require('path')
const url = require('url')
const crypto = require('crypto')

// External
const dayjs = require('dayjs')
const utc = require('dayjs/plugin/utc')
dayjs.extend(utc)
const Joi = require('joi')
const jwt = require("jsonwebtoken")
const OTPAuth = require('otpauth')
const jsonPatch = require('fast-json-patch')

// Internal
const { getMediator } = require("../../domain/use_cases/mediator.uc")
const { getConnectionPool } = require("../../adapters/database/database")
const UserRepository = require("../../adapters/database/repositories/user.repository")
const CryptService = require('../../adapters/security/encryption.service')
const PasswordService = require('../../adapters/security/password.service')
const EmailService = require('../../adapters/network/email.service')

// #region usecases
const { ChangePasswordUseCase, ChangePasswordUseCaseName } = require("../../domain/use_cases/auth/change_password.uc")
const { DoLoginUseCase, DoLoginUseCaseName } = require("../../domain/use_cases/auth/do_login.uc")
const { DisableOtpUseCase, DisableOtpUseCaseName } = require("../../domain/use_cases/auth/otp/disable_otp.uc")
const { FinishOtpRegistrationUseCase, FinishOtpRegistrationUseCaseName } = require("../../domain/use_cases/auth/otp/finish_otp_registration.uc")
const { GetOtpUriUseCase, GetOtpUriUseCaseName } = require("../../domain/use_cases/auth/otp/get_otp_uri.uc")
const { StartOtpRegistrationUseCase, StartOtpRegistrationUseCaseName } = require("../../domain/use_cases/auth/otp/start_otp_registration.uc")
const { ValidateOtpUseCase, ValidateOtpUseCaseName } = require("../../domain/use_cases/auth/otp/validate_otp.uc")
const { RequestPasswordRecoveryUseCase, RequestPasswordRecoveryUseCaseName } = require("../../domain/use_cases/auth/request_password_recovery.uc")
const { CreateUserUseCase, CreateUserUseCaseName } = require("../../domain/use_cases/users/create_user.uc")
const { GetUserUseCase, GetUserUseCaseName } = require("../../domain/use_cases/users/get_user.uc")
const { ListUserHistoriesUseCase, ListUserHistoriesUseCaseName } = require("../../domain/use_cases/users/list_user_histories.uc")
const { ListUsersUseCase, ListUsersUseCaseName } = require("../../domain/use_cases/users/list_users.uc")
const { UpdateUserUseCase, UpdateUserUseCaseName } = require("../../domain/use_cases/users/update_user.uc")
// #endregion usecases

function registerUseCases() {
  const mediator = getMediator()
  
  // #region AUTH
  mediator.register(ChangePasswordUseCaseName, () => new ChangePasswordUseCase({ dayjs, Joi, path }, new UserRepository(getConnectionPool()), new CryptService(), new PasswordService(), new EmailService()))
  mediator.register(DoLoginUseCaseName, () => new DoLoginUseCase({ Joi, jwt }, new UserRepository(getConnectionPool()), new PasswordService()))
  mediator.register(RequestPasswordRecoveryUseCaseName, () => new RequestPasswordRecoveryUseCase({ dayjs, Joi, path, url }, new UserRepository(getConnectionPool()), new CryptService(), new EmailService()))
  mediator.register(DisableOtpUseCaseName, () => new DisableOtpUseCase({ Joi }, new UserRepository(getConnectionPool())))
  mediator.register(FinishOtpRegistrationUseCaseName, () => new FinishOtpRegistrationUseCase({ Joi, jwt, OTPAuth }, new UserRepository(getConnectionPool())))
  mediator.register(StartOtpRegistrationUseCaseName, () => new StartOtpRegistrationUseCase({ crypto, Joi, OTPAuth }, new UserRepository(getConnectionPool())))
  mediator.register(ValidateOtpUseCaseName, () => new ValidateOtpUseCase({ Joi, jwt, OTPAuth }, new UserRepository(getConnectionPool())))
  mediator.register(GetOtpUriUseCaseName, () => new GetOtpUriUseCase({ Joi }, new UserRepository(getConnectionPool())))
  // #endregion AUTH
  
  // #region USERS
  mediator.register(CreateUserUseCaseName, () => new CreateUserUseCase({ Joi }, new UserRepository(getConnectionPool()), new PasswordService()))
  mediator.register(GetUserUseCaseName, () => new GetUserUseCase({ Joi }, new UserRepository(getConnectionPool())))
  mediator.register(ListUsersUseCaseName, () => new ListUsersUseCase({ Joi }, new UserRepository(getConnectionPool())))
  mediator.register(ListUserHistoriesUseCaseName, () => new ListUserHistoriesUseCase({ Joi }, new UserRepository(getConnectionPool())))
  mediator.register(UpdateUserUseCaseName, () => new UpdateUserUseCase({ Joi, jsonPatch }, new UserRepository(getConnectionPool())))
  // #endregion USERS
}

function Initializer() {
  this.init = function() {
    registerUseCases()
  }
}

module.exports = new Initializer()