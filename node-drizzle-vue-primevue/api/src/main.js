//#region Imports
require("dotenv").config()
require('./shared/configurations').load()

const express = require("express")
const createError = require("http-errors")
const path = require("path")
const cookieParser = require("cookie-parser")
const cors = require("cors")
const compression = require("compression")

const diInitializer = require('./shared/configurations/di')

const { errorHandler } = require("./adapters/middlewares/error.handler")
const interceptor = require("./adapters/middlewares/interceptor")
const hbsHelper = require("./adapters/handlebars/hbs.helper")

const homeRoute = require("./adapters/routes/home.router")
const pingRoute = require("./adapters/routes/ping.router")
const authRoute = require("./adapters/routes/auth.router")
const usersRoute = require("./adapters/routes/users.router")
//#endregion Imports

diInitializer.init()

const app = express()

// gzip
app.use(compression())

// view engine setup
hbsHelper.registerHelpers()
app.set("views", path.join(__dirname, "views"))
app.set("view engine", "hbs")
app.locals.layout = "_shared/layout";

// middlewares
app.use(
  cors({
    origin: global.configurations.app.uri,
  })
)
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())
app.use("/static", express.static(path.join(__dirname, "..", "public")))
app.use(interceptor)

// routes
app.use(homeRoute)
app.use(pingRoute)
app.use(authRoute)
app.use(usersRoute)

// catch 404 and forward to error handler
app.use((_req, _res, next) => {
  next(createError(404))
})

// error handler
app.use((error, req, res, _next) => {
  errorHandler(req, res, error)
})

app.listen(global.configurations.server.port, () => {
  console.info(`[server]: Server is running at http://localhost:${global.configurations.server.port}`)
})
