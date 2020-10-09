const express = require('express');
const auth = require('./auth.js');

function pessoa_query() {

  const router = express.Router();

  router.get('/pessoa_query', function (req, res, next) {

    auth.db_conn().query(
      'SELECT * FROM func_forn',
      [],
      (error, results) => {
        if (error) {
          console.log(error);
          res.status(500).json({status: 'error'});
        } else {
          res.status(200).json(results);
        }
      }
    );
  });

return router;
}
module.exports = pessoa_query;
