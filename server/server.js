const express = require('express');
const app = express();
require('dotenv').config();
const cors = require('cors');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

const port = '3000';
const www = "MYSQL DATABASE CONNECTION" || './';
app.use(express.static(www));
app.use(bodyParser.json())
app.use(cookieParser());

var allowedOrigins = ['zepcoil.cq9uwckifigu.sa-east-1.rds.amazonaws.com:3306',
                      'http://localhost:3000',
                      'http://localhost:4401',
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
const auth = require('./models/auth.js');

// server functions
const lancamentos_query = require('./models/lancamentos_query.js');
const terceiros_query = require('./models/terceiros_query.js');
const contratos_query = require('./models/contratos_query.js');
const pagamentos_contratos_query = require('./models/pagamentos_contratos_query.js');
const aux_query = require('./models/aux_query.js');
const CC_query = require('./models/cc_query.js');
const div_CC_query = require('./models/div_cc_query.js');
const pessoa_query = require('./models/pessoa_query.js');
const sp_query = require('./models/stored.procedures.js');

app.use(auth.auth_router(auth_connection));
app.use(lancamentos_query());
app.use(terceiros_query());
app.use(contratos_query());
app.use(aux_query());
app.use(CC_query());
app.use(div_CC_query());
app.use(pessoa_query());
app.use(sp_query());
app.use(pagamentos_contratos_query())

console.log(`serving ${www}`);
app.get('*', (req, res) => {
  res.send(`MYSQL SERVER - ZEPCOIL DATABASE`);
});
app.listen(port, () => console.log(`listening on http://localhost:${port}`));
