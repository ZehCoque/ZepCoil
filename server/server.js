const express = require('express');
const app = express();
//require('dotenv').config();
const cors = require('cors');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

const port = "3000";
const www = "MYSQL DATABASE CONNECTION" || './';
app.use(express.static(www));
app.use(bodyParser.json())
app.use(cookieParser());

var allowedOrigins = ['http://localhost:3000',
                      'http://localhost:4200'];

app.use(cors({
  credentials: true,
  origin: function(origin, callback){
    if(!origin) return callback(null, true);
    if(allowedOrigins.indexOf(origin) === -1){
      var msg = 'The CORS policy for this site does not ' +
                'allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  }
}));

// connection auth with mysql
const auth_connection = require('./connection/auth.connection.js');

// server functions
const main_table_query = require('./models/main_table_query.js');
const auth = require('./models/auth.js');

app.use(auth.auth_router(auth_connection));
app.use(main_table_query());

console.log(`serving ${www}`);
app.get('*', (req, res) => {
  res.send(`MYSQL SERVER - ZEPCOIL DATABASE`);
});
app.listen(port, () => console.log(`listening on http://localhost:${port}`));
