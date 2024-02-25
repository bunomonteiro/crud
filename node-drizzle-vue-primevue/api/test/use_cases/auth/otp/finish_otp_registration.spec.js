const assert = require("assert")
const sinon = require('sinon')
const Joi = require('joi')
const jwt = require("jsonwebtoken")
const OTPAuth = require('otpauth')
const crypto = require('crypto')
const { TOTP } = require('totp-generator')

const { getConnectionPool } = require("../../../../src/adapters/database/database")
const UserRepository = require('../../../../src/adapters/database/repositories/user.repository')
const { FinishOtpRegistrationUseCase, FinishOtpRegistrationRequest } = require("../../../../src/domain/use_cases/auth/otp/finish_otp_registration.uc")

describe("Caso de uso: Concluir registro 2FA", () => {
  let repository

  beforeEach(() => { repository = new UserRepository(getConnectionPool()) })

  it("Deve concluir registro 2FA", async () => {
    // arrange
    const secret = crypto.randomBytes(15).toString('hex')
   
    const original_getUserByUsername = repository.getUserByUsername
    sinon.stub(repository, 'getUserByUsername').callsFake(async (username) => {
      const user = await original_getUserByUsername(username)
      user.otpSecret = secret
      return user
    })
    const updateUserSpy = sinon.spy(repository, 'updateUser')
    const createUserHistorySpy = sinon.spy(repository, 'createUserHistory')
   
    const totp = new OTPAuth.TOTP({ algorithm: 'SHA1', digits: 6, period: 30, secret: OTPAuth.Secret.fromHex(secret) })
    const usecase = new FinishOtpRegistrationUseCase({Joi, jwt, OTPAuth}, repository)
    const request = new FinishOtpRegistrationRequest()    
    request.username = 'usuario.teste_1'
    request.code = TOTP.generate(totp.secret.base32, { algorithm: 'SHA-1', digits: 6, period: 30 }).otp
    
    // act
    const response = await usecase.handleAsync(request)

    // assert
    assert(response, "Não teve retorno")
    assert.equal(response.error, null, "Retornou erro")
    assert(repository.getUserByUsername.calledOnce, "Não consultou o usuário")
    assert(updateUserSpy.calledOnce, "Não atualizou o usuário")
    assert(updateUserSpy.getCall(0).args[0].otpEnabled, "Não ativou a 2FA")
    assert(updateUserSpy.getCall(0).args[0].otpVerified, "Não fez a auto-veirifcação da 2FA")
    assert(createUserHistorySpy.calledOnce, "Não registrou o histórico")
  })

  it("Não deve concluir registro 2FA quando código for inválido", async () => {
    // arrange
    const secret = crypto.randomBytes(15).toString('hex')
   
    const original_getUserByUsername = repository.getUserByUsername
    sinon.stub(repository, 'getUserByUsername').callsFake(async (username) => {
      const user = await original_getUserByUsername(username)
      user.otpSecret = secret
      return user
    })
    const updateUserSpy = sinon.spy(repository, 'updateUser')
    const createUserHistorySpy = sinon.spy(repository, 'createUserHistory')
   
    const usecase = new FinishOtpRegistrationUseCase({Joi, jwt, OTPAuth}, repository)
    const request = new FinishOtpRegistrationRequest()    
    request.username = 'usuario.teste_1'
    request.code = '111111'
    
    // act
    const response = await usecase.handleAsync(request)

    // assert
    assert(response, "Não teve retorno")
    assert(response.error, "Não retornou erro")
    assert(response.message, "Não retornou mensagem")
    assert(repository.getUserByUsername.calledOnce, "Não consultou o usuário")
    assert(updateUserSpy.notCalled, "Não atualizou o usuário")
    assert(createUserHistorySpy.notCalled, "Não registrou o histórico")
  })

  it("Não deve concluir registro 2FA quando usuário não existir", async () => {
    // arrange
    const getUserByUsernameSpy = sinon.spy(repository, 'getUserByUsername')
    const updateUserSpy = sinon.spy(repository, 'updateUser')
    const createUserHistorySpy = sinon.spy(repository, 'createUserHistory')
    
    const secret = crypto.randomBytes(15).toString('hex')
    const totp = new OTPAuth.TOTP({ algorithm: 'SHA1', digits: 6, period: 30, secret: OTPAuth.Secret.fromHex(secret) })
    const usecase = new FinishOtpRegistrationUseCase({Joi, jwt, OTPAuth}, repository)
    const request = new FinishOtpRegistrationRequest()    
    request.username = 'usuario_inexistente'
    request.code = TOTP.generate(totp.secret.base32, { algorithm: 'SHA-1', digits: 6, period: 30 }).otp
    
    // act
    const response = await usecase.handleAsync(request)

    // assert
    assert(response, "Não teve retorno")
    assert(response.error, "Não retornou erro")
    assert(response.message, "Não retornou mensagem")
    assert(getUserByUsernameSpy.calledOnce, "Não consultou o usuário")
    assert(updateUserSpy.notCalled, "Não atualizou o usuário")
    assert(createUserHistorySpy.notCalled, "Não registrou o histórico")
  })
})
