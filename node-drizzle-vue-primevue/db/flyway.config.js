require('dotenv').config()

// This can be a function or an object literal.
module.exports = function () {
  return {
    flywayArgs: {
      url: process.env.FLYWAY_DB_URL,
      schemas: process.env.FLYWAY_DB_SCHEMAS,
      locations: 'filesystem:src/versions',
      user: process.env.FLYWAY_DB_USER,
      password: process.env.FLYWAY_DB_PASS,
      sqlMigrationSuffixes: '.sql',
      baselineVersion: '1.0.0',
      baselineDescription: 'BASELINE',
      validateMigrationNaming: false,
      cleanDisabled: false
    },
    // Use to configure environment variables used by flyway
    env: {
      JAVA_ARGS: '-Djava.util.logging.config.file=./conf/logging.properties',
    },
    version: '10.8.1',
    mavenPlugins: [{ // optional, use to add any plugins (ie. logging)
      groupId: 'org.slf4j',
      artifactId: 'slf4j-api',
      version: '1.7.25',
      // This can be a specifc url to download that may be different then the auto generated url.
      downloadUrl: 'https://repo1.maven.org/maven2/org/slf4j/slf4j-api/1.7.25/slf4j-api-1.7.25.jar',
    }, {
      groupId: 'org.slf4j',
      artifactId: 'slf4j-jdk14',
      version: '1.7.25'
    }],
    downloads: {
      storageDirectory: './.cli', // optional, the specific directory to store the flyway downloaded files. The directory must be writable by the node app process' user.
      expirationTimeInMs: -1, // optional, -1 will never check for updates, defaults to 1 day.
    }
  };
};