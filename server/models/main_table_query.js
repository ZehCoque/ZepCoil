const express = require('express');
const auth = require('../models/auth.js');

function main_pn_info_router() {

  const router = express.Router();
    router.post('/main_table_query', (req, res, next) => {

      auth.db_conn().query(
        'INSERT INTO lançamentos (`Descricao`, `Data_Entrada`, `CC`, `Div_CC`, `Vencimento`, `Valor`, `Observacao`, `Tipo`, `N_Invest`, `Pessoa`,`Responsavel`) VALUES (?,?,?,?,?,?,?,?,?,?,?)',
        [req.body.Descricao,
          new Date(req.body.Data_Entrada),
          req.body.CC,
          req.body.Div_CC,
          new Date(req.body.Vencimento),
          req.body.Valor,
          req.body.Observacao,
          req.body.Tipo,
          req.body.N_Invest,
          req.body.Pessoa,
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

    auth.db_conn().query(
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
    auth.db_conn().query(
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
    auth.db_conn().query(
      'UPDATE lançamentos SET `Descricao` = ?,`Data_Entrada`=?, `CC` = ?, `Div_CC` = ?, `Vencimento` = ?,`Valor` = ?, `Observacao` = ?,`Tipo` = ?, `N_Invest`=?, `Pessoa`=?, `Responsavel`=?  WHERE `ID`=?',
      [req.body.Descricao,
        new Date(req.body.Data_Entrada),
        req.body.CC,
        req.body.Div_CC,
        new Date(req.body.Vencimento),
        req.body.Valor,
        req.body.Observacao,
        req.body.Tipo,
        req.body.N_Invest,
        req.body.Pessoa,
        req.body.Responsavel,
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

  router.post('/main_table_query_SF', function (req, res, next) {

    let query_string = 'WHERE 1=1';

    let active_filters = req.body.active_filters;

    for (var key in active_filters) {
      if (active_filters.hasOwnProperty(key)) {
          if (active_filters[key] != ''){
            query_string = query_string + ' AND ' + key + ' = ' + active_filters[key];
          }
      }
  }

  console.log(query_string);

    auth.db_conn().query(
      'SELECT * FROM lançamentos ORDER BY ' + req.body.active_sorts + ' ' + req.body.sort_dir,
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
module.exports = main_pn_info_router;
