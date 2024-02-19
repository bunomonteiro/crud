//#region
const express = require("express");
const status = require("http-status");

const { errorHandler, Errors } = require("../common/errors.helper");
const { auth } = require("../common/middlewares/auth");
const { getMediator, UseCases } = require("../use_cases/mediator.uc");

const { GetUserRequest } = require("../use_cases/users/get_user.uc");
const { ListUsersRequest } = require("../use_cases/users/list_users.uc");
const { CreateUserRequest } = require("../use_cases/users/create_user.uc");
const { UpdateUserRequest } = require("../use_cases/users/update_user.uc");
const { ListUserHistoriesRequest } = require("../use_cases/users/list_user_histories.uc");
//#endregion

const router = express.Router();

/**
 * GET
 * get a user by username
 */
router.get("/api/v1/users/:username", auth, async (req, res, next) => {
  try {
    const request = new GetUserRequest();
    request.username = req.params.username;

    const response = await getMediator().handleAsync(UseCases.USERS__GET_USER, request);

    if (response.error) {
      res.status(status.BAD_REQUEST);
    }

    res.json(response);
  } catch (error) {
    errorHandler(req, res, Errors.users.getUser(error));
  }
});

/**
 * GET
 * get all users
 */
router.get("/api/v1/users/", auth, async (req, res, next) => {
  try {
    const request = new ListUsersRequest({
      page: req.query.page,
      size: req.query.size,
      sorting: req.query.sorting ?? [],
      filters: req.query.filters
    });
    
    const response = await getMediator().handleAsync(UseCases.USERS__LIST_USERS, request);

    if (response.error) {
      res.status(status.BAD_REQUEST);
    }

    res.json(response);
  } catch (error) {
    errorHandler(req, res, Errors.users.listUsers(error));
  }
});

/**
 * GET
 * get all users
 */
router.get("/api/v1/user-histories", auth, async (req, res, next) => {
  try {
    const request = new ListUserHistoriesRequest({
      page: req.query.page,
      size: req.query.size,
      sorting: req.query.sorting ?? [],
      filters: req.query.filters ?? {},
    });

    const response = await getMediator().handleAsync(UseCases.USERS__LIST_USER_HISTORIES, request);

    if (response.error) {
      res.status(status.BAD_REQUEST);
    }

    res.json(response);
  } catch (error) {
    errorHandler(req, res, Errors.users.listUsers(error));
  }
});

/**
 * POST
 * create a new user
 */
router.post("/api/v1/users/", auth, async (req, res, next) => {
  try {
    const request = new CreateUserRequest();
    request.operator = req.body.$token.sub;
    request.name = req.body.name;
    request.email = req.body.email;
    request.username = req.body.username;
    request.password = req.body.password;
    request.avatar = req.body.avatar;
    request.cover = req.body.cover;

    const response = await getMediator().handleAsync(UseCases.USERS__CREATE_USER, request);

    if (response.error) {
      res.status(status.BAD_REQUEST);
    }

    res.json(response);
  } catch (error) {
    errorHandler(req, res, Errors.users.createUser(error));
  }
});

/**
 * PATCH
 * update the user
 */
router.patch("/api/v1/users/:username", auth, async (req, res, next) => {
  try {
    const request = new UpdateUserRequest();
    request.operator = req.body.$token.sub;
    request.username = req.params.username;
    request.patches = req.body.patches;

    const response = await getMediator().handleAsync(UseCases.USERS__UPDATE_USER, request);

    if (response.error) {
      res.status(status.BAD_REQUEST);
    }

    res.json(response);
  } catch (error) {
    errorHandler(req, res, Errors.users.updateUser(error));
  }
});

module.exports = router;
