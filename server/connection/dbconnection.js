const mysql = require('mysql');

function create_connection(username,password) {
      return new Promise((resolve, reject) => {
        var connection  = mysql.createPool({
          host            : 'zepcoil.coyu9rmcmge8.sa-east-1.rds.amazonaws.com',
          user            : username,
          password        : password,
          database        : 'zepcoil',
        });

        resolve(connection);

  })
}

module.exports = create_connection;
