const express = require('express');
const auth = require('./auth.js');

function pagamentos_contratos_router() {

  const router = express.Router();

  router.post('/pagamentos_contratos_query/:Identificacao', function (req, res, next) {
    auth.db_conn().getConnection((err,connection) => {

      if (err) {
      res.status(404).json((err));
      return
      }

      let database = connection.config.database + '.';

    connection.query(
      'SELECT * FROM ' + database + 'contratos_pgtos WHERE Identificacao = ? LIMIT 100',
      [req.body.Identificacao],
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

  router.post('/pagamentos_contratos_query_insert', (req, res, next) => {
    auth.db_conn().getConnection((err,connection) => {

      if (err) {
      res.status(404).json((err));
      return
      }

      let database = connection.config.database + '.';
      connection.query(
      'INSERT INTO ' + database + '`contratos_pgtos` (`Identificacao`, `DataPgto`, `Fav1`, `Valor1`, `ValorPiscina`, `Fav2`, `Valor2`, `Fav3`, `Valor3`, `FavCom`, `ValorCom`, `PCom`) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?,?,?,?);',
      [
        req.body.Identificacao,
        new Date(req.body.DataPgto),
        req.body.Fav1,
        req.body.Valor1,
        req.body.ValorPiscina,
        req.body.Fav2,
        req.body.Valor2,
        req.body.Fav3,
        req.body.Valor3,
        req.body.FavCom,
        req.body.ValorCom,
        req.body.PCom
      ],
      (error) => {
        if (error) {
          console.error(error);
          res.status(500).json({status: 'error'});
        } else {
          res.status(200).json({status: 'ok'});
        }
      }
    );
    connection.release();
  });
  });


router.delete('/pagamentos_contratos_query', function (req, res, next) {
  auth.db_conn().getConnection((err,connection) => {

    if (err) {
      res.status(404).json((err));
      return
      }

    let database = connection.config.database + '.';
    connection.query(
    'DELETE FROM ' + database + 'contratos_pgtos WHERE `Identificacao`=?',
    [req.body.Identificacao,
     req.body.DataPgmt,
    ],
    (error) => {
      if (error) {
        res.status(500).json({status: 'error'});
      } else {
        res.status(200).json({status: 'ok'});
      }
    }
  );
  connection.release();
});
});

router.put('/pagamentos_contratos_query/:Identificacao/:DataPgmt', function (req, res, next) {
  auth.db_conn().getConnection((err,connection) => {

    if (err) {
      res.status(404).json((err));
      return
      }

    let database = connection.config.database + '.';
    connection.query(
    'UPDATE ' + database + 'contratos SET `DataPgto` = ?,`Fav1` = ?,`Valor1` = ?,`ValorPiscina` = ?,`Fav2` = ?,`Valor2` = ?,`Fav3` = ?,`Valor3` = ?,`FavCom` = ?,`ValorCom` = ?,`PCom` = ?  WHERE `Identificacao`=? and `DataPgmt`=?',
    [
      new Date(req.body.DataPgto),
      req.body.Fav1,
      req.body.Valor1,
      req.body.ValorPiscina,
      req.body.Fav2,
      req.body.Valor2,
      req.body.Fav3,
      req.body.Valor3,
      req.body.FavCom,
      req.body.ValorCom,
      req.body.PCom
    ],
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
module.exports = pagamentos_contratos_router;
