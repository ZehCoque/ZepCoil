var mysql = require('mysql');

var connection  = mysql.createConnection({
  connectionLimit : 10,
  host            : 'localhost',
  user            : 'remote_access',
  password        : 'supersecretpassword',
  database        : 'prototype1',
});


connection.connect(function(err) {
  console.error('Trying connection to ' + connection.config.host + ' as ' + connection.config.user);
  if (err) {
      console.error('Error connecting to remote database: ' + err);
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

