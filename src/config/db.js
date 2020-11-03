var arangojs = require('arangojs'),
  db = new arangojs.Database({ 
    // Database connection
    url:  "127.0.0.1:8529"
  }),
  aql = arangojs.aql

// Database selection
db.useDatabase("testdb");

// Speficy the database user
db.useBasicAuth("root", "root");

module.exports = {
  db,
  aql
};