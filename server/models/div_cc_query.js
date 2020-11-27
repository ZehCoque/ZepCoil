const express = require('express');
const auth = require('./auth.js');

function div_CC_router() {

  const router = express.Router();

  router.post('/div_cc_query/:Nome', function (req, res, next) {
    auth.db_conn().getConnection((err,connection) => {

      if (err) {
      res.status(404).json((err));
      return
      }

      let database = connection.config.database + '.';
      connection.query(
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
    connection.release();
  });
  });

  router.post('/div_cc_query_add', function (req, res, next) {
    auth.db_conn().getConnection((err,connection) => {

      if (err) {
      res.status(404).json((err));
      return
      }

      let database = connection.config.database + '.';
      connection.query(
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
    connection.release();
  });
  });

  router.delete('/div_cc_query_delete', function (req, res, next) {
    auth.db_conn().getConnection((err,connection) => {

      if (err) {
      res.status(404).json((err));
      return
      }

      let database = connection.config.database + '.';
      connection.query(
      'DELETE FROM ' + database + 'divisao_cc WHERE Nome=?',
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
module.exports = div_CC_router;
