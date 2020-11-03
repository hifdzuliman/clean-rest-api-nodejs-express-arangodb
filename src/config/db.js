var config = require("../env"),
  arangojs = require('arangojs'),
  db = new arangojs.Database({ 
    // Database connection
    url:  config.database.url
  }),
  aql = arangojs.aql

// Database selection
db.useDatabase(config.database.database);

// Speficy the database user
db.useBasicAuth(config.database.username, config.database.password);

module.exports = {
  db,
  aql
};