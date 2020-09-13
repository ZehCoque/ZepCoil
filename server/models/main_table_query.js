const express = require('express');

function main_pn_info_router(db) {
  const router = express.Router();

  router.post('/main_table_query', (req, res, next) => {
    db.query(
      'INSERT INTO lançamentos (`ID`,`Nome`, `Data_Entrada`, `CC`, `Div_CC`, `Vencimento`, `Valor`, `Observacao`, `Tipo`) VALUES (?,?,?,?,?,?,?,?,?)',
      [req.body.ID,
        req.body.Nome,
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
    'SELECT * FROM lançamentos ORDER BY id',
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

router.get('/max_id', function (req, res, next) {
  db.query(
    'SELECT Max(ID)+1 AS max_id FROM lançamentos',
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

router.put('/edit_main_table/:ID', function (req, res, next) {
  db.query(
    'UPDATE lançamentos SET `Nome` = ?, `Data_Entrada` = ?, `CC` = ?, `Div_CC` = ?, `Vencimento` = ?, `Valor` = ?, `Observacao` = ?, `Tipo` = ? WHERE ID=?',
    [ req.body.Nome,
      new Date(req.body.Data_Entrada),
      req.body.CC,
      req.body.Div_CC,
      new Date(req.body.Vencimento),
      req.body.Valor,
      req.body.Observacao,
      req.body.Tipo,
      req.body.ID],
    (error) => {
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
