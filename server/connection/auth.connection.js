var mysql = require('mysql');
require('dotenv').config();

var connection  = mysql.createPool({
  host            : 'zepcoil.cq9uwckifigu.sa-east-1.rds.amazonaws.com',
  user            : 'authenticator',
  password        : 'N99FrLuBDNPCqb58',
  database        : 'accounts',
});

module.exports = connection;

