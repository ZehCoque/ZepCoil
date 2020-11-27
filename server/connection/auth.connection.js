var mysql = require('mysql');
require('dotenv').config();

var connection  = mysql.createPool({
  host            : 'localhost',
  user            : 'authenticator',
  password        : 'N99FrLuBDNPCqb58',
  database        : 'accounts',
});

module.exports = connection;

