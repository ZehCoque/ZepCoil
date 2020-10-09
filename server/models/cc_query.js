const express = require('express');
const auth = require('./auth.js');

function CC_router() {

  const router = express.Router();
  
  router.get('/cc_query', function (req, res, next) {

    auth.db_conn().query(
      'SELECT * FROM cc',
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
module.exports = CC_router;
