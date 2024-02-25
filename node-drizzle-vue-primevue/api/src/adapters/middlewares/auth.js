const jwt = require("jsonwebtoken")
const status = require("http-status")

const { errorHandler } = require("./error.handler")
const { Errors } = require("./../../domain/exceptions/errors")

function auth(req, res, next) {
  try {
    if (global.configurations.server.isDevelopment && global.configurations.api.auth.disabled) {
      next()
    } else {
      let token = req.headers["authorization"] || "";
      
      if (new RegExp("^bearer", "i").test(token)) {
        token = token.trim().replace(/^Bearer\s+/i, "")
        const decoded = jwt.verify(token, global.configurations.api.auth.token.key)

        if(!decoded?.user?.otpEnabled) {
          const unauthorizedError = new Error()
          unauthorizedError.status = status.UNAUTHORIZED;
          unauthorizedError.message = status["401_NAME"];
          errorHandler(req, res, Errors.auth.otpRequired(unauthorizedError))
        } else if(!decoded?.user?.otpValidated) {
          const unauthorizedError = new Error()
          unauthorizedError.status = status.UNAUTHORIZED;
          unauthorizedError.message = status["401_NAME"];
          errorHandler(req, res, Errors.auth.verifiedOtpRequired(unauthorizedError))
        } else {
          // SUCCESS!
          req.body.$token = decoded;
          next()
        }
      } else {
        const unauthorizedError = new Error()
        unauthorizedError.status = status.UNAUTHORIZED;
        unauthorizedError.message = status["401_NAME"];
        errorHandler(req, res, Errors.auth.tokenRequired(unauthorizedError))
      }
    }
  } catch (error) {
    errorHandler(req, res, Errors.auth.tokenValidation(error))
  }
}

function authPreOTP(req, res, next) {
  try {
    if (global.configurations.server.isDevelopment && global.configurations.api.auth.disabled) {
      next()
    } else {
      let token = req.headers["authorization"] || "";
      
      if (new RegExp("^bearer", "i").test(token)) {
        token = token.trim().replace(/^Bearer\s+/i, "")
        const decoded = jwt.verify(token, global.configurations.api.auth.token.key)
        req.body.$token = decoded;
        next()
      } else {
        const unauthorizedError = new Error()
        unauthorizedError.status = status.UNAUTHORIZED;
        unauthorizedError.message = status["401_NAME"];
        errorHandler(req, res, Errors.auth.tokenRequired(unauthorizedError))
      }
    }
  } catch (error) {
    errorHandler(req, res, Errors.auth.tokenValidation(error))
  }
}

module.exports = {
  auth,
  authPreOTP
}
