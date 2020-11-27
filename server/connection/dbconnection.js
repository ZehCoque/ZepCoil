const mysql = require('mysql');

function create_connection(username,password) {
      return new Promise((resolve, reject) => {
        var connection  = mysql.createPool({
          host            : 'localhost',
          user            : username,
          password        : password,
          database        : 'zepcoil',
        });

        resolve(connection);

  })
}

module.exports = create_connection;
