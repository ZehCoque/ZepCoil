const mysql = require('mysql');

function create_connection(username,password) {
      return new Promise((resolve, reject) => {
        var connection  = mysql.createConnection({
          host            : 'localhost',
          user            : username,
          password        : password,
          database        : 'zepcoil',
        });

        connection.connect(function(err) {
          console.error('Trying connection to ' + connection.config.host + ' as ' + connection.config.user);
          if (err) {
              console.error('Error connecting to remote database: ' + err);
              reject(err);
          }
          console.log('Connected to REMOTE DATABASE as ' + connection.config.user);
          resolve(connection);
        });

        connection.on('error', function(err) {
          console.log('db error normal;', err);
          if(err.code === 'PROTOCOL_CONNECTION_LOST') {
              console.log('connect lost');
              reject(err);
          }
          else {
              throw err;
          }
        });


      })

  }

module.exports = create_connection;
