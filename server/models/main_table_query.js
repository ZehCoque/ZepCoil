const express = require('express');

function main_pn_info_router(connection) {
  const router = express.Router();
    router.post('/main_table_query', (req, res, next) => {
      connection.query(
        'INSERT INTO lançamentos (`Descricao`, `Data_Entrada`, `CC`, `Div_CC`, `Vencimento`, `Valor`, `Observacao`, `Tipo`, `N_Invest`, `Nome_f`,`Responsavel`) VALUES (?,?,?,?,?,?,?,?,?,?,?)',
        [req.body.Descricao,
          new Date(req.body.Data_Entrada),
          req.body.CC,
          req.body.Div_CC,
          new Date(req.body.Vencimento),
          req.body.Valor,
          req.body.Observacao,
          req.body.Tipo,
          req.body.N_Invest,
          req.body.Nome_f,
          req.body.Responsavel],
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
    connection.query(
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

  router.delete('/main_table_query/:ID', function (req, res, next) {
    connection.query(
      'DELETE FROM lançamentos WHERE ID=?',
      [req.body.ID],
      (error) => {
        if (error) {
          res.status(500).json({status: 'error'});
        } else {
          res.status(200).json({status: 'ok'});
        }
      }
    );
  });

  router.put('/main_table_query/:ID', function (req, res, next) {
    connection.query(
      'UPDATE lançamentos SET `Descricao` = ?,`Data_Entrada`=?, `CC` = ?, `Div_CC` = ?, `Vencimento` = ?,`Valor` = ?, `Observacao` = ?,`Tipo` = ?, `N_Invest`=?, `Nome_f`=?, `Responsavel`=?  WHERE `ID`=?',
      [req.body.Descricao,
        new Date(req.body.Data_Entrada),
        req.body.CC,
        req.body.Div_CC,
        new Date(req.body.Vencimento),
        req.body.Valor,
        req.body.Observacao,
        req.body.Tipo,
        req.body.N_Invest,
        req.body.Nome_f,
        req.body.Responsavel,
        req.body.ID],
      (error) => {
        console.log(req.body.ID)
        if (error) {
          res.status(500).json({status: 'error'});
        } else {
          res.status(200).json({status: 'ok'});
        }
      }
    );
  });

return router;
}
module.exports = main_pn_info_router;
