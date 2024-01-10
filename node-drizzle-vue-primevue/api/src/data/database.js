const { Pool } = require("pg");
const configurations = require('../services/configurations/configuration.service')

/**
 * Obtém a instancia da connection pool
 * @returns {Pool}
 */
function getConnectionPool() {
  if (global.connectionPool) {
    return global.connectionPool;
  }

  const pgConfig = {
    connectionString: configurations.db.connectionString,
    ssl: configurations.db.ssl,
  };

  const connectionPool = new Pool(pgConfig);

  global.connectionPool = connectionPool;
  return global.connectionPool;
}

module.exports = {
  getConnectionPool,
};
