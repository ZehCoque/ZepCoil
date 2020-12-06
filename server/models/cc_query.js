const express = require('express');
const auth = require('./auth.js');

function CC_router() {

  const router = express.Router();

  router.get('/cc_query', function (req, res, next) {

    auth.db_conn().getConnection((err,connection) => {

      if (err) {
      res.status(404).json((err));
      return
      }

    let database = connection.config.database + '.';
    connection.query(
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
    connection.release();
    });
  });

  router.post('/cc_query_add', function (req, res, next) {
    auth.db_conn().getConnection((err,connection) => {

      if (err) {
      res.status(404).json((err));
      return
      }

    let database = connection.config.database + '.';
    connection.query(
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
    connection.release();
  });
  });

  router.delete('/cc_query_delete', function (req, res, next) {
    auth.db_conn().getConnection((err,connection) => {

      if (err) {
      res.status(404).json((err));
      return
      }

    let database = connection.config.database + '.';
    connection.query(
      'DELETE FROM ' + database + 'cc WHERE Nome=?',
      [req.body.Nome],
      (error) => {
        if (error) {
          console.log(error)
          res.status(500).json({status: 'error'});
        } else {
          res.status(200).json({status: 'ok'});
        }
      }
    );
    connection.release();
  });
  });

return router;
}
module.exports = CC_router;
