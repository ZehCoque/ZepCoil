var mysql = require('mysql');

var connection  = mysql.createConnection({
  connectionLimit : 10,
  host            : process.env.DB_HOST,
  user            : process.env.DB_USERNAME,
  password        : process.env.DB_PASSWORD,
  database        : process.env.DB_NAME,
});


connection.connect(function(err) {
  console.error('Trying connection to ' + connection.config.host + ' as ' + connection.config.user);
  if (err) {
      console.error('Error connecting to remote database: ' + err);
      console.error('Trying local connection...');
      connection  = mysql.createConnection({
        connectionLimit : 10,
        host            : process.env.DB_LOCALHOST,
        user            : process.env.DB_USERNAME,
        password        : process.env.DB_PASSWORD,
        database        : process.env.DB_NAME,
      });
      connection.connect(function(err) {
        if (err){
          console.error('Error connecting to local database: ' + err);
        }
        console.log('Connected to LOCAL DATABASE as ' + connection.config.user);
      });
      return;
  }
  console.log('Connected to REMOTE DATABASE as ' + connection.config.user);
});

connection.on('error', function(err) {
  console.log('db error normal;', err);
  if(err.code === 'PROTOCOL_CONNECTION_LOST') {
      console.log('connect lost');
  }
  else {
      throw err;
  }
});

module.exports = connection;

