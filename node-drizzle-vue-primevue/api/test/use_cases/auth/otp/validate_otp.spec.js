const assert = require("assert")
const sinon = require('sinon')
const Joi = require('joi')
const jwt = require("jsonwebtoken")
const OTPAuth = require('otpauth')
const crypto = require('crypto')
const { TOTP } = require('totp-generator')

const { getConnectionPool } = require("../../../../src/adapters/database/database")
const UserRepository = require('../../../../src/adapters/database/repositories/user.repository')
const { ValidateOtpUseCase, ValidateOtpRequest } = require("../../../../src/domain/use_cases/auth/otp/validate_otp.uc")

describe("Caso de uso: Validar 2FA", () => {
  let repository

  beforeEach(() => { repository = new UserRepository(getConnectionPool()) })

  it("Deve validar 2FA", async () => {
    // arrange
    const secret = crypto.randomBytes(15).toString('hex')
   
    const original_getUserByUsername = repository.getUserByUsername
    sinon.stub(repository, 'getUserByUsername').callsFake(async (username) => {
      const user = await original_getUserByUsername(username)
      user.otpSecret = secret
      user.otpEnabled = true
      user.otpVerified = true
      return user
    })
    const createUserHistorySpy = sinon.spy(repository, 'createUserHistory')
   
    const totp = new OTPAuth.TOTP({ algorithm: 'SHA1', digits: 6, period: 30, secret: OTPAuth.Secret.fromHex(secret) })
    const usecase = new ValidateOtpUseCase({Joi, jwt, OTPAuth}, repository)
    const request = new ValidateOtpRequest()    
    request.username = 'usuario.teste_2'
    request.code = TOTP.generate(totp.secret.base32, { algorithm: 'SHA-1', digits: 6, period: 30 }).otp
    
    // act
    const response = await usecase.handleAsync(request)

    // assert
    assert(response, "Não teve retorno")
    assert.equal(response.error, null, "Retornou erro")
    assert(repository.getUserByUsername.calledOnce, "Não consultou o usuário")
    assert(createUserHistorySpy.calledOnce, "Não registrou o histórico")
  })

  it("Não deve validar 2FA quando o usuário não tiver 2FA habilitado", async () => {
    // arrange
    const secret = crypto.randomBytes(15).toString('hex')
   
    const original_getUserByUsername = repository.getUserByUsername
    sinon.stub(repository, 'getUserByUsername').callsFake(async (username) => {
      const user = await original_getUserByUsername(username)
      user.otpSecret = secret
      user.otpEnabled = false
      user.otpVerified = true
      return user
    })
    const createUserHistorySpy = sinon.spy(repository, 'createUserHistory')
   
    const totp = new OTPAuth.TOTP({ algorithm: 'SHA1', digits: 6, period: 30, secret: OTPAuth.Secret.fromHex(secret) })
    const usecase = new ValidateOtpUseCase({Joi, jwt, OTPAuth}, repository)
    const request = new ValidateOtpRequest()    
    request.username = 'usuario.teste_2'
    request.code = TOTP.generate(totp.secret.base32, { algorithm: 'SHA-1', digits: 6, period: 30 }).otp
    
    // act
    const response = await usecase.handleAsync(request)

    // assert
    assert(response, "Não teve retorno")
    assert(response.error, "Não retornou erro")
    assert(response.message, "Não retornou mensagem")
    assert(repository.getUserByUsername.calledOnce, "Não consultou o usuário")
    assert(createUserHistorySpy.notCalled, "Registrou o histórico desnecessariamente")
  })

  it("Não deve validar 2FA quando o usuário não tiver 2FA verificado", async () => {
    // arrange
    const secret = crypto.randomBytes(15).toString('hex')
   
    const original_getUserByUsername = repository.getUserByUsername
    sinon.stub(repository, 'getUserByUsername').callsFake(async (username) => {
      const user = await original_getUserByUsername(username)
      user.otpSecret = secret
      user.otpEnabled = true
      user.otpVerified = false
      return user
    })
    const createUserHistorySpy = sinon.spy(repository, 'createUserHistory')
   
    const totp = new OTPAuth.TOTP({ algorithm: 'SHA1', digits: 6, period: 30, secret: OTPAuth.Secret.fromHex(secret) })
    const usecase = new ValidateOtpUseCase({Joi, jwt, OTPAuth}, repository)
    const request = new ValidateOtpRequest()    
    request.username = 'usuario.teste_2'
    request.code = TOTP.generate(totp.secret.base32, { algorithm: 'SHA-1', digits: 6, period: 30 }).otp
    
    // act
    const response = await usecase.handleAsync(request)

    // assert
    assert(response, "Não teve retorno")
    assert(response.error, "Não retornou erro")
    assert(response.message, "Não retornou mensagem")
    assert(repository.getUserByUsername.calledOnce, "Não consultou o usuário")
    assert(createUserHistorySpy.notCalled, "Registrou o histórico desnecessariamente")
  })

  it("Não deve validar 2FA quando código for inválido", async () => {
    // arrange
    const secret = crypto.randomBytes(15).toString('hex')
   
    const original_getUserByUsername = repository.getUserByUsername
    sinon.stub(repository, 'getUserByUsername').callsFake(async (username) => {
      const user = await original_getUserByUsername(username)
      user.otpSecret = secret
      user.otpEnabled = true
      user.otpVerified = true
      return user
    })
    const createUserHistorySpy = sinon.spy(repository, 'createUserHistory')
   
    const usecase = new ValidateOtpUseCase({Joi, jwt, OTPAuth}, repository)
    const request = new ValidateOtpRequest()
    request.username = 'usuario.teste_2'
    request.code = '111111'
    
    // act
    const response = await usecase.handleAsync(request)

    // assert
    assert(response, "Não teve retorno")
    assert(response.error, "Não retornou erro")
    assert(response.message, "Não retornou mensagem")
    assert(repository.getUserByUsername.calledOnce, "Não consultou o usuário")
    assert(createUserHistorySpy.notCalled, "Não registrou o histórico")
  })

  it("Não deve validar 2FA quando usuário não existir", async () => {
    // arrange
    const getUserByUsernameSpy = sinon.spy(repository, 'getUserByUsername')
    const createUserHistorySpy = sinon.spy(repository, 'createUserHistory')
    
    const secret = crypto.randomBytes(15).toString('hex')
    const totp = new OTPAuth.TOTP({ algorithm: 'SHA1', digits: 6, period: 30, secret: OTPAuth.Secret.fromHex(secret) })
    const usecase = new ValidateOtpUseCase({Joi, jwt, OTPAuth}, repository)
    const request = new ValidateOtpRequest()
    request.username = 'usuario_inexistente'
    request.code = TOTP.generate(totp.secret.base32, { algorithm: 'SHA-1', digits: 6, period: 30 }).otp
    
    // act
    const response = await usecase.handleAsync(request)

    // assert
    assert(response, "Não teve retorno")
    assert(response.error, "Não retornou erro")
    assert(response.message, "Não retornou mensagem")
    assert(getUserByUsernameSpy.calledOnce, "Não consultou o usuário")
    assert(createUserHistorySpy.notCalled, "Não registrou o histórico")
  })
})
