const mysql = require('mysql');

function create_connection(username,password) {
      return new Promise((resolve, reject) => {
        var connection  = mysql.createConnection({
          host            : 'localhost',
          user            : username,
          password        : password,
          database        : 'zepcoil',
        });

        connection.on('connect', function(err) {

          if (err){
            console.error('Error connecting to remote database: ' + err);
            reject (err);
          }

          console.log('Connected to REMOTE DATABASE as ' + connection.config.user);
        })

        resolve(connection);

  })
}

module.exports = create_connection;
