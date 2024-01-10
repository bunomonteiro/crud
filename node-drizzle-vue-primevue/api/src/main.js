//#region Imports
require("dotenv").config();
const express = require("express");
const createError = require("http-errors");
const path = require("path");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const compression = require("compression");

const { errorHandler } = require("./common/errors.helper");
const interceptor = require("./common/middlewares/interceptor");
const hbsHelper = require("./common/hbs.helper");
const configurations = require('./services/configurations/configuration.service')

const homeRoute = require("./routes/home.router");
const pingRoute = require("./routes/ping.router");
const authRoute = require("./routes/auth.router");
const usersRoute = require("./routes/users.router");
//#endregion Imports

const app = express();

// gzip
app.use(compression());

// view engine setup
hbsHelper.registerHelpers();
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "hbs");
app.locals.layout = "_shared/layout";

// middlewares
app.use(
  cors({
    origin: configurations.app.uri,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use("/static", express.static(path.join(__dirname, "..", "public")));
app.use(interceptor);

// routes
app.use(homeRoute);
app.use(pingRoute);
app.use(authRoute);
app.use(usersRoute);

// catch 404 and forward to error handler
app.use((_req, _res, next) => {
  next(createError(404));
});

// error handler
app.use((error, req, res, _next) => {
  errorHandler(req, res, error);
});

app.listen(configurations.server.port, () => {
  console.info(`[server]: Server is running at http://localhost:${configurations.server.port}`);
});
