const express = require('express');
const auth = require('./auth.js');

function div_CC_router() {

  const router = express.Router();

  router.post('/div_cc_query/:Nome', function (req, res, next) {
    let database = auth.db_conn().config.database + '.';
    auth.db_conn().query(
      'SELECT * FROM ' + database + 'divisao_cc WHERE Nome = ?',
      [req.body.Nome],
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

  router.post('/div_cc_query_add', function (req, res, next) {
    console.log(req.body)
    let database = auth.db_conn().config.database + '.';
    auth.db_conn().query(
      'INSERT INTO ' + database + 'divisao_cc (`Nome`,`Divisao`) VALUES (?,?)',
      [req.body.Nome,req.body.Divisao],
      (error, results) => {
        if (error) {
          console.log(error);
          res.status(409).json(error);
        } else {
          res.status(200).json(results);
        }
      }
    );
  });

return router;
}
module.exports = div_CC_router;
