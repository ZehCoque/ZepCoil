const express = require('express');
const auth = require('./auth.js');

function CC_router() {

  const router = express.Router();

  router.get('/cc_query', function (req, res, next) {
    let database = auth.db_conn().config.database + '.';
    auth.db_conn().query(
      'SELECT * FROM ' + database + 'cc',
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

  router.post('/cc_query_add', function (req, res, next) {
    let database = auth.db_conn().config.database + '.';
    auth.db_conn().query(
      'INSERT INTO ' + database + 'cc (`Nome`,`Descricao`) VALUES (?,?)',
      [req.body.Nome,req.body.Descricao],
      (error, results) => {
        if (error) {
          console.log(error);
          res.status(409 ).json(error);
        } else {
          res.status(200).json(results);
        }
      }
    );
  });

return router;
}
module.exports = CC_router;
