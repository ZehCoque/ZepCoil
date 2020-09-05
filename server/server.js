const express = require('express');
const app = express();
require('dotenv').config();
const cors = require('cors');
const bodyParser = require('body-parser');

const allowedOrigins = process.env.allowedOrigins.split(',');
const port = process.env.PORT;
const www = process.env.WWW || './';
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
const pool = require('./connection/dbconnection.js');

// server functions
const pn_list = require('./models/pn_list.js');
const nf_list = require('./models/nf_list.js');
const fake_nf_server = require('./models/fake_nf_server.js');
const main_pn_info = require('./models/main_pn_info.js');

app.use(pn_list(pool));
app.use(nf_list(pool));
app.use(fake_nf_server(pool));
app.use(main_pn_info(pool));

console.log(`serving ${www}`);
app.get('*', (req, res) => {
  res.send(`MYSQL SERVER - EZWMS DATABASE`);
});
app.listen(port, () => console.log(`listening on http://localhost:${port}`));
