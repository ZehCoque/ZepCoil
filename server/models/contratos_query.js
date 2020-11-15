const express = require('express');
const auth = require('./auth.js');
const query_builder = require('./query_builder.js')

function contratos_router() {

  const router = express.Router();

    router.post('/contratos_query/:ID', function (req, res, next) {
      let database = auth.db_conn().config.database + '.'
      auth.db_conn().query(
        'SELECT * FROM ' + database + 'view_contratos WHERE ID = ?',
        [req.body.ID],
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

  router.post('/contratos_query_column/:column', function (req, res, next) {
    let database = auth.db_conn().config.database + '.'

    let query_string = query_builder.filter('WHERE 1=1',req.body.active_filters)

    auth.db_conn().query(
      'SELECT DISTINCT ' + req.body.column + ' FROM ' + database + 'view_contratos ' + query_string,
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

  router.post('/contratos_query', function (req, res, next) {
    let database = auth.db_conn().config.database + '.'

    let query_string = query_builder.sort(query_builder.filter('WHERE 1=1',req.body.active_filters),req.body.active_sorts,req.body.dir)

    auth.db_conn().query(
      'SELECT * FROM ' + database + 'contratos ' + query_string,
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

  router.post('/contratos_query_insert', (req, res, next) => {
    let database = auth.db_conn().config.database + '.'
    auth.db_conn().query(
      'INSERT INTO ' + database + 'contratos (`Descricao`, `Data_Entrada`, `CC`, `Div_CC`, `Vencimento`, `Valor`, `Observacao`, `Tipo`, `N_Invest`, `Pessoa`,`Responsavel`,`Concluido`,`Imposto`,`Tipo_despesa`) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)',
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
        req.body.Concluido,
        req.body.Imposto,
        req.body.Tipo_despesa
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
  });

router.get('/max_id_contratos', function (req, res, next) {
  let database = auth.db_conn().config.database + '.'
  auth.db_conn().query(
    'SELECT MAX(ID) as max_id FROM ' + database + 'contratos',
    [],
    (error, results) => {
      if (!results.max_id){
        auth.db_conn().query(
          'ALTER TABLE ' + database + 'contratos AUTO_INCREMENT = 1',
          []);
      }
      if (error) {
        console.log(error);
        res.status(500).json({status: 'error'});
      } else {
        res.status(200).json(results);
      }
    }
  );
});

router.delete('/contratos_query', function (req, res, next) {
  let database = auth.db_conn().config.database + '.'
  auth.db_conn().query(
    'DELETE FROM ' + database + 'contratos WHERE ID=?',
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

return router;
}
module.exports = contratos_router;
