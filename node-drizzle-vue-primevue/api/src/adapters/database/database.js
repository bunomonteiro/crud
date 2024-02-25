const { Pool } = require("pg")

/**
 * Obtém a instancia da connection pool
 * @returns {Pool}
 */
function getConnectionPool() {
  if (global.connectionPool) {
    return global.connectionPool;
  }

  const pgConfig = {
    connectionString: global.configurations.db.connectionString,
    ssl: global.configurations.db.ssl,
  };

  const connectionPool = new Pool(pgConfig)

  global.connectionPool = connectionPool;
  return global.connectionPool;
}

module.exports = {
  getConnectionPool,
};
