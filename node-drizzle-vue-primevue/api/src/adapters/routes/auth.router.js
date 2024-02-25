//#region
const express = require("express")
const status = require("http-status")

const { getMediator } = require("../../domain/use_cases/mediator.uc")
const { auth, authPreOTP } = require("../middlewares/auth")
const { errorHandler } = require("../middlewares/error.handler")
const { Errors } = require("./../../domain/exceptions/errors")

const { DoLoginRequest, DoLoginUseCaseName } = require("../../domain/use_cases/auth/do_login.uc")
const { StartOtpRegistrationRequest, StartOtpRegistrationUseCaseName } = require("../../domain/use_cases/auth/otp/start_otp_registration.uc")
const { FinishOtpRegistrationRequest, FinishOtpRegistrationUseCaseName } = require("../../domain/use_cases/auth/otp/finish_otp_registration.uc")
const { ValidateOtpRequest, ValidateOtpUseCaseName } = require("../../domain/use_cases/auth/otp/validate_otp.uc")
const { DisableOtpRequest, DisableOtpUseCaseName } = require("../../domain/use_cases/auth/otp/disable_otp.uc")
const { RequestPasswordRecoveryRequest, RequestPasswordRecoveryUseCaseName } = require("../../domain/use_cases/auth/request_password_recovery.uc")
const { ChangePasswordRequest, ChangePasswordUseCaseName } = require("../../domain/use_cases/auth/change_password.uc")
const { CreateUserRequest, CreateUserUseCaseName } = require("../../domain/use_cases/users/create_user.uc")
const { GetOtpUriRequest, GetOtpUriUseCaseName } = require("../../domain/use_cases/auth/otp/get_otp_uri.uc")
const { UserHistoryModel } = require("../../domain/entities/user.aggregate")
//#endregion

const router = express.Router()

/**
 * POST
 * Signin (get token).
 */
router.post("/api/v1/auth/actions/signin", async (req, res, next) => {
  try {
    const request = new DoLoginRequest()
    request.username = req.body.username;
    request.password = req.body.password;

    const response = await getMediator().handleAsync(DoLoginUseCaseName, request)

    if (response.error) {
      res.status(status.UNAUTHORIZED)
      res.end()
    } else {
      res.json(response)
    }
  } catch (error) {
    errorHandler(req, res, Errors.auth.signin(error))
  }
})

/**
 * POST
 * Signup
 */
router.post("/api/v1/auth/actions/signup", async (req, res, next) => {
  try {
    const request = new CreateUserRequest()
    request.operator = global.configurations.api.users.system.username;
    request.eventName = UserHistoryModel.EVENT_USER_SIGNED_UP;
    request.name = req.body.name;
    request.email = req.body.email;
    request.username = req.body.username;
    request.password = req.body.password;
    request.avatar = req.body.avatar;
    request.cover = req.body.cover;

    let response = await getMediator().handleAsync(CreateUserUseCaseName, request)
    
    if(!response.error) {
      const loginRequest = new DoLoginRequest()
      loginRequest.username = request.username;
      loginRequest.password = request.password;
      response = await getMediator().handleAsync(DoLoginUseCaseName, loginRequest)
    }

    if (response.error) {
      res.status(status.BAD_REQUEST)
      res.end()
    } else {
      res.json(response)
    }
  } catch (error) {
    errorHandler(req, res, Errors.auth.signup(error))
  }
})

/**
 * POST
 * Start TOTP 2FA registration
 */
router.post("/api/v1/auth/otp/actions/start-registration", authPreOTP, async (req, res, next) => {
  try {
    const request = new StartOtpRegistrationRequest({
      username: req.body.$token.sub
    })
    
    const response = await getMediator().handleAsync(StartOtpRegistrationUseCaseName, request)

    if(response.error) {
      res.status(status.BAD_REQUEST).json(response)
    } else {
      res.json(response)
    }
  } catch (error) {
    errorHandler(req, res, Errors.auth.generateOTP(error))
  }
})

/**
 * POST
 * Finish TOTP 2FA registration
 */
router.post('/api/v1/auth/otp/actions/finish-registration', authPreOTP, async function(req, res, next) {
  try {
    const request = new FinishOtpRegistrationRequest({
      username: req.body.$token.sub,
      code: req.body.code
    })

    const response = await getMediator().handleAsync(FinishOtpRegistrationUseCaseName, request)

    if(response.error) {
      res.status(status.BAD_REQUEST).json(response)
    } else {
      res.json(response)
    }
  } catch (error) {
    errorHandler(req, res, Errors.auth.verifyOTP(error))
  }
})

/**
 * GET
 * Generate TOTP 2FA
 */
router.get('/api/v1/auth/otp/actions/get-uri', authPreOTP, async function(req, res, next) {
  try {
    const request = new GetOtpUriRequest({
      username: req.body.$token.sub,
    })
    
    const response = await getMediator().handleAsync(GetOtpUriUseCaseName, request)

    if(response.error) {
      res.status(status.BAD_REQUEST).json(response)
    } else {
      res.json(response)
    }
  } catch (error) {
    errorHandler(req, res, Errors.auth.validateOTP(error))
  }
})

/**
 * POST
 * Validate TOTP 2FA
 */
router.post('/api/v1/auth/otp/actions/validate', authPreOTP, async function(req, res, next) {
  try {
    const request = new ValidateOtpRequest({
      username: req.body.$token.sub,
      code: req.body.code
    })
    
    const response = await getMediator().handleAsync(ValidateOtpUseCaseName, request)

    if(response.error) {
      res.status(status.BAD_REQUEST).json(response)
    } else {
      res.json(response)
    }
  } catch (error) {
    errorHandler(req, res, Errors.auth.validateOTP(error))
  }
})

/**
 * POST
 * Disable TOTP 2FA
 */
router.post('/api/v1/auth/otp/actions/disable', auth, async function(req, res, next) {
  try {
    const request = new DisableOtpRequest({
      username: req.body.$token.sub
    })
    
    const response = await getMediator().handleAsync(DisableOtpUseCaseName, request)

    if(response.error) {
      res.status(status.BAD_REQUEST).json(response)
    } else {
      res.json(response)
    }
  } catch (error) {
    errorHandler(req, res, Errors.auth.disableOTP(error))
  }
})

/**
 * POST
 * Request password recovery
 */
router.post("/api/v1/auth/actions/request-password-recovery", async (req, res, next) => {
  try {
    const request = new RequestPasswordRecoveryRequest()
    request.username = req.body.username;

    const response = await getMediator().handleAsync(RequestPasswordRecoveryUseCaseName, request)

    if (response.error) {
      res.status(status.UNAUTHORIZED).json(response)
    } else {
      res.status(status.OK).end()
    }
  } catch (error) {
    errorHandler(req, res, Errors.auth.requestPasswordRecovery(error))
  }
})

/**
 * POST
 * Change password
 */
router.post("/api/v1/auth/actions/change-password/:token", async (req, res, next) => {
  try {
    const request = new ChangePasswordRequest()
    request.token = req.params.token;
    request.password = req.body.password;

    const response = await getMediator().handleAsync(ChangePasswordUseCaseName, request)

    if (response.error) {
      res.status(status.UNAUTHORIZED).json(response)
    } else {
      res.status(status.OK).end()
    }
  } catch (error) {
    errorHandler(req, res, Errors.auth.changePassword(error))
  }
})

module.exports = router;
