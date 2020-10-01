const express = require('express');
const app = express();
//require('dotenv').config();
const cors = require('cors');
const bodyParser = require('body-parser');
var session = require('express-session');

app.use(session({
	secret: 'secret',
	resave: true,
	saveUninitialized: true
}));

//const allowedOrigins = process.env.allowedOrigins.split(',');
const port = "3000";
const www = "MYSQL DATABASE CONNECTION" || './';
app.use(express.static(www));
app.use(bodyParser.json())
// ****** allow cross-origin requests code START ****** //
app.use(cors()); // uncomment this to enable all CORS and delete cors(corsOptions) in below code

/**
app.use(cors({
    origin: function (origin, callback) {
        // allow requests with no origin
        // (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) === -1) {
            var msg = 'The CORS policy for this site does not ' + 'allow access from the specified Origin.';
            return callback(new Error(msg), false);
        }
        return callback(null, true);
    }
}));
 */
// ****** allow cross-origin requests code END ****** //

// connection auth with mysql
const connection = require('./connection/dbconnection.js');

// server functions
const main_table_query = require('./models/main_table_query.js');

app.use(main_table_query(connection));

console.log(`serving ${www}`);
app.get('*', (req, res) => {
  res.send(`MYSQL SERVER - ZEPCOIL DATABASE`);
});
app.listen(port, () => console.log(`listening on http://localhost:${port}`));
