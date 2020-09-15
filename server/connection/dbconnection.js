var mysql = require('mysql');

var connection  = mysql.createConnection({
  connectionLimit : 10,
  host            : process.env.DB_LOCALHOST,
  user            : process.env.DB_USERNAME,
  password        : process.env.DB_PASSWORD,
  database        : process.env.DB_NAME,
});
connection.connect(function(err) {
  if (err) {
      console.error('error connecting: ' + err.stack);
      return;
  }
  console.log('data base connected as id ' + connection.threadId);
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

//keep active your database connection

setInterval(function () {
  console.log('timeout completed');
  var sql="select id from table_name limit 1";
  connection.query(sql, function(err, result, field){
      console.log('running query for non idle ');
  });
}, 600000);

module.exports = {connection, mysql};

