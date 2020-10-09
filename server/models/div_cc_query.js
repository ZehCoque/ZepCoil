const express = require('express');
const auth = require('./auth.js');

function div_CC_router() {

  const router = express.Router();

  router.post('/div_cc_query/:Nome', function (req, res, next) {
    auth.db_conn().query(
      'SELECT * FROM divisao_cc WHERE Nome = ?',
      [req.body.Nome],
      (error, results) => {
        console.log(results)
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
module.exports = div_CC_router;
