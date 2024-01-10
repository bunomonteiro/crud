const { Pool } = require("pg");
const { drizzle } = require("drizzle-orm/node-postgres");
const { eq, ilike, count, desc, and, asc } = require("drizzle-orm");

const configurations = require('../../services/configurations/configuration.service')
const { filtersToWhere, sortingToOrderBy } = require('../../common/drizzle.helper')

const {
  UserSchema,
  UserHistorySchema,
  // relations
  UserRelations,
  UserHistoryRelations
} = require("../schemas");
const { PaginatedQueryModel, UserModel, UserHistoryModel } = require("../models");
const { alias } = require("drizzle-orm/pg-core");

/**
 * Repositório de usuários
 * @param {Pool} connector
 */
function UserRepository(connector) {
  let _db = drizzle(connector, { 
    logger: configurations.server.isDevelopment, 
    schema: { 
      users: UserSchema,
      userHistories: UserHistorySchema,
      // relations
      userRelations: UserRelations,
      userHistoryRelations: UserHistoryRelations,
    }
  })

  // #region User
  /**
   * Consulta o usuário por seu identificador
   * @param {(number)} id
   * @returns {Promise<UserModel>}
   */
  this.getUserById = async function (id) {
    const user = await _db.query.users.findFirst({
      where: eq(UserSchema.id, id)
    });
    
    return user ? new UserModel(user) : null;
  };

  /**
   * Consulta o usuário por seu username
   * @param {(string)} username
   * @returns {Promise<UserModel>}
   */
  this.getUserByUsername = async function (username) {
    const user = await _db.query.users.findFirst({
      where: ilike(UserSchema.username, username)
    });

    return user ? new UserModel(user) : null;
  };

  /**
   * Consulta todos os usuários com paginação
   * @param {Number} page Página atual
   * @param {Number} size Tamanho da página
   * @param {Object} options Configurações da consulta
   * @param {object[]} options.sorting Configuração da ordenação
   * @param {object} options.filters Filtros da consulta
   * @returns {Promise<PaginatedQueryModel>}
   */
  this.listAllUsers = async function (page, size, options = {}) {
    const offset = page * size;

    const where = filtersToWhere(options.filters, (target, filter) => {
      if(target === "id") {
        filter.column = UserSchema.id
        return
      }

      if(target === "name") {
        filter.column = UserSchema.name
        return
      }

      if(target === "username") {
        filter.column = UserSchema.username
        return
      }

      if(target === "email") {
        filter.column = UserSchema.email
        return
      }

      if(target === "active") {
        filter.column = UserSchema.active
        return
      }

      if(target === "otpEnabled") {
        filter.column = UserSchema.otpEnabled
        return
      }
    })

    let orderBy = sortingToOrderBy(options.sorting, (target) => {
      if(target === "id") { return UserSchema.id }
      if(target === "name") { return UserSchema.name }
      if(target === "username") { return UserSchema.username }
      if(target === "email") { return UserSchema.email }
      if(target === "active") { return UserSchema.active }
      if(target === "otpEnabled") { return UserSchema.otpEnabled }
    })

    orderBy = orderBy.length ? orderBy : [asc(UserSchema.id)]
    
    const queryCount = _db.$with('queryCount').as(
      _db.select({ total: count().as("total_rows") })
        .from(UserSchema)
        .where(where)
    );

    const resultSet = await _db.with(queryCount)
      .select()
      .from(UserSchema)
      .innerJoin(queryCount, true)
      .where(where)
      .orderBy(...orderBy)
      .limit(size)
      .offset(offset)

    const pagination = new PaginatedQueryModel();
    pagination.totalRows = parseInt(resultSet[0]?.queryCount.total) || 0;
    pagination.currentPage = page;
    pagination.pageSize = size;
    pagination.data = resultSet?.map((row) => new UserModel(row.user));

    return pagination;
  };

  /**
   * Cria um novo usuário
   * @param {UserModel} user
   * @returns {Promise<UserModel>}
   */
  this.createUser = async function (user) {
    const newUser = await _db.insert(UserSchema)
      .values(user)
      .returning();

    return new UserModel(newUser[0]);
  };

  /**
   * Atualiza o usuário alvo
   * @param {UserModel} user usuário alvo com as propriedades atualizadas
   * @returns {Promise<UserModel>}
   */
  this.updateUser = async function (user) {
    const resultSet = await _db.update(UserSchema)
      .set({
        name: user.name,
        username: user.username?.toLowerCase(),
        email: user.email?.toLowerCase(),
        password: user.password,
        passwordRecoveryToken: user.passwordRecoveryToken,
        avatar: user.avatar,
        cover: user.cover,
        otpSecret: user.otpSecret,
        otpUri: user.otpUri,
        otpEnabled: user.otpEnabled,
        otpVerified: user.otpVerified,
        active: user.active
      })
      .where(eq(UserSchema.id, user.id))
      .returning();

    return resultSet?.map((row) => new UserModel(row))[0];
  };
  // #endregion User

  // #region User History
  /**
   * Consulta o histórico do usuário por seu identificador
   * @param {number} id Identificador do registro histórico
   * @returns {Promise<UserHistoryModel>}
   */
  this.getUserHistoryById = async function (id) {
    const operator = alias(UserSchema, "operator")
    const user = alias(UserSchema, "user")

    const history = await _db.select()
      .from(UserHistorySchema)
      .innerJoin(operator, eq(UserHistorySchema.operatorId, operator.id))
      .innerJoin(user, eq(UserHistorySchema.userId, user.id))
      .where(eq(UserHistorySchema.id, id))
    
    return history ? new UserHistoryModel({...history[0].user_history, operator: history[0].operator, user: history[0].user }) : null;
  };

  /**
   * Lista os históricos do usuário com paginação
   * @param {Number} page Página atual
   * @param {Number} size Tamanho da página
   * @param {Number} id Id do usuário
   * @returns {Promise<PaginatedQueryModel>}
   */
  this.listUserHistoriesByUserId = async function (page, size, id) {
    const offset = page * size;

    const queryCount = _db.$with('queryCount').as(
      _db.select({ total: count().as("total_rows") })
        .from(UserHistorySchema)
        .where(eq(UserHistorySchema.userId, id))
    );

    const operator = alias(UserSchema, "operator")
    const user = alias(UserSchema, "user")

    const resultSet = await _db.with(queryCount)
      .select()
      .from(UserHistorySchema)
      .innerJoin(queryCount, true)
      .innerJoin(operator, eq(UserHistorySchema.operatorId, operator.id))
      .innerJoin(user, eq(UserHistorySchema.userId, user.id))
      .where(eq(UserHistorySchema.userId, id))
      .orderBy(desc(UserHistorySchema.createdAt))
      .limit(size)
      .offset(offset)

    const pagination = new PaginatedQueryModel();
    pagination.totalRows = parseInt(resultSet[0]?.queryCount.total) || 0;
    pagination.currentPage = page;
    pagination.pageSize = size;
    pagination.data = resultSet?.map((row) => new UserHistoryModel({...row.user_history, operator: row.operator, user: row.user }));

    return pagination;
  };

  /**
   * Lista os históricos do usuário por seu username com paginação
   * @param {Number} page Página atual
   * @param {Number} size Tamanho da página
   * @param {string} username Nome de usuário (login) do usuário alvo
   * @returns {Promise<PaginatedQueryModel>}
   */
  this.listUserHistoriesByUsername = async function (page, size, username) {
    const user = await this.getUserByUsername(username);

    return await this.listUserHistoriesByUserId(page, size, user.id);
  };

  /**
   * Consulta todos os históricos de todos os usuários com paginação
   * @param {Number} page Página atual
   * @param {Number} size Tamanho da página
   * @param {Object} options Configurações da consulta
   * @param {object[]} options.sorting Configuração da ordenação
   * @param {object} options.filters Filtros da consulta
   * @returns {Promise<PaginatedQueryModel>}
   */
  this.listAllUserHistories = async function (page, size, options = {}) {
    const offset = page * size;
    
    const operator = alias(UserSchema, "operator")
    const user = alias(UserSchema, "user")

    const where = filtersToWhere(options.filters, (target, filter) => {
      if(target === "user.name") {
        filter.column = user.name
        return
      }

      if(target === "event") {
        filter.column = UserHistorySchema.event
        return
      }

      if(target === "operator.name") {
        filter.column = operator.name
        return
      }

      if(target === "createdAt") {
        filter.column = UserHistorySchema.createdAt
        return
      }
    })

    const orderBy = sortingToOrderBy(options.sorting, (target) => {
      if(target === 'event') {
        return UserHistorySchema.event
      }

      if(target === 'createdAt') {
        return UserHistorySchema.createdAt
      }

      if(target === 'user.name') {
        return user.name
      }

      if(target === 'operator.name') {
        return operator.name
      }
    })

    const queryCount = _db.$with('queryCount').as(
      _db.select({ total: count().as("total_rows") })
        .from(UserHistorySchema)
        .innerJoin(operator, eq(UserHistorySchema.operatorId, operator.id))
        .innerJoin(user, eq(UserHistorySchema.userId, user.id))
        .where(where)
    );

    const resultSet = await _db.with(queryCount)
      .select()
      .from(UserHistorySchema)
      .innerJoin(queryCount, true)
      .innerJoin(operator, eq(UserHistorySchema.operatorId, operator.id))
      .innerJoin(user, eq(UserHistorySchema.userId, user.id))
      .where(where)
      .orderBy(...orderBy)
      .limit(size)
      .offset(offset)

    const pagination = new PaginatedQueryModel();
    pagination.totalRows = parseInt(resultSet[0]?.queryCount.total) || 0;
    pagination.currentPage = page;
    pagination.pageSize = size;
    pagination.data = resultSet?.map((row) => new UserHistoryModel({...row.user_history, operator: row.operator, user: row.user }));

    return pagination;
  };

  /**
   * Cria um novo histórico de usuário
   * @param {UserHistoryModel} history
   * @returns {Promise<UserHistoryModel>}
   */
  this.createUserHistory = async function (history) {
    const newHistory = await _db.insert(UserHistorySchema)
      .values(history)
      .returning();

    return new UserHistoryModel(newHistory[0]);
  };
  // #endregion User History
}

module.exports = UserRepository;
