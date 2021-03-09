const mysql = require('mysql');
const dbConfig = require('../server.variables')

function create_connection(username,password) {
      return new Promise((resolve, reject) => {
        var connection  = mysql.createPool({
          host            : dbConfig.HOST,
          user            : username,
          password        : password,
          database        : dbConfig.MAINDATABASE,
        });

        resolve(connection);

  })
}

module.exports = create_connection;
