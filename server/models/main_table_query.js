const express = require('express');

function main_pn_info_router(db) {
  const router = express.Router();
  db.getConnection(function(err, connection) {
    router.post('/main_table_query', (req, res, next) => {
      db.query(
        'INSERT INTO lançamentos (`Descrição`, `Data_Entrada`, `CC`, `Div_CC`, `Vencimento`, `Valor`, `Observacao`, `Tipo`) VALUES (?,?,?,?,?,?,?,?)',
        [req.body.Nome,
          new Date(req.body.Data_Entrada),
          req.body.CC,
          req.body.Div_CC,
          new Date(req.body.Vencimento),
          req.body.Valor,
          req.body.Observacao,
          req.body.Tipo],
        (error) => {
          if (error) {
            console.error(error);
            res.status(500).json({status: 'error'});
          } else {
            res.status(200).json({status: 'ok'});
          }
        }
      );
    });

  router.get('/main_table_query', function (req, res, next) {
    db.query(
      'SELECT * FROM lançamentos ORDER BY ID',
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
  });

return router;
}
module.exports = main_pn_info_router;
