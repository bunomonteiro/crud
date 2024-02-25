const assert = require("assert")
const path = require('path')
const url = require('url')
const sinon = require('sinon')
const dayjs = require('dayjs')
const utc = require('dayjs/plugin/utc')
dayjs.extend(utc)
const Joi = require('joi')

const CryptService = require('../../../src/adapters/security/encryption.service')
const EmailService = require('../../../src/adapters/network/email.service')
const { getConnectionPool } = require("../../../src/adapters/database/database")
const UserRepository = require('../../../src/adapters/database/repositories/user.repository')
const { RequestPasswordRecoveryUseCase, RequestPasswordRecoveryRequest } = require("../../../src/domain/use_cases/auth/request_password_recovery.uc")

describe("Caso de uso: Solicitar recuperação de senha", () => {
  let repository
  let cryptServiceSpy
  let emailServiceSpy

  beforeEach(() => { 
    repository = sinon.spy(new UserRepository(getConnectionPool())) 
    cryptServiceSpy = sinon.spy(new CryptService())
    emailServiceSpy = sinon.spy(new EmailService())
  })

  it("Deve solicitar recuperação de senha", async () => {
    // arrange
    const usecase = new RequestPasswordRecoveryUseCase({dayjs, Joi, path, url}, repository, cryptServiceSpy, emailServiceSpy)
    const request = new RequestPasswordRecoveryRequest()

    request.username = 'usuario.teste_1' // from hooks.js
    
    // act
    const response = await usecase.handleAsync(request)

    // assert
    assert(response, "Não teve retorno")
    assert.equal(response.error, null, "Retornou erro")
    assert(repository.updateUser.calledOnce, "Não registrou o token")
    assert(repository.createUserHistory.calledOnce, "Não registrou o histórico")
    assert(cryptServiceSpy.encrypt.calledOnce, "Não criptografou o token")
    assert(emailServiceSpy.sendAsync.calledOnce, "Não enviou email")
  })
})
