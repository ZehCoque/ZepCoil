const express = require('express');
const auth = require('./auth.js');

function aux_query_router() {

  const router = express.Router();

    router.post('/main_table_query_get/:ID', function (req, res, next) {
      auth.db_conn().getConnection((err,connection) => {

        if (err) {
      res.status(404).json((err));
      return
      }

        let database = connection.config.database + '.';
        connection.query(
        'SELECT * FROM ' + database + 'lançamentos WHERE ID = ?',
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
      connection.release();
    });
    });

    router.post('/historico_query/:ID', function (req, res, next) {
      auth.db_conn().getConnection((err,connection) => {

        if (err) {
      res.status(404).json((err));
      return
      }

        let database = connection.config.database + '.';
        connection.query(
        'SELECT * FROM ' + database + 'historico WHERE ID = ?',
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
      connection.release();
    });
    });

    router.post('/main_table_query', (req, res, next) => {
      auth.db_conn().getConnection((err,connection) => {

        if (err) {
      res.status(404).json((err));
      return
      }

        let database = connection.config.database + '.';
        connection.query(
        'INSERT INTO ' + database + 'lançamentos (`Descricao`, `Data_Entrada`, `CC`, `Div_CC`, `Vencimento`, `Valor`, `Observacao`, `Tipo`, `N_Invest`, `Pessoa`,`Responsavel`,`Concluido`,`Imposto`,`Tipo_despesa`) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)',
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
      connection.release();
    });
    });

  router.get('/max_id', function (req, res, next) {
    auth.db_conn().getConnection((err,connection) => {

      if (err) {
      res.status(404).json((err));
      return
      }

      let database = connection.config.database + '.';
      connection.query(
      'SELECT MAX(ID) as max_id FROM ' + database + 'lançamentos',
      [],
      (error, results) => {
        if (!results.max_id){
          auth.db_conn().query(
            'ALTER TABLE ' + database + 'lançamentos AUTO_INCREMENT = 1',
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
    connection.release();
  });
  });

  router.delete('/main_table_query', function (req, res, next) {
    auth.db_conn().getConnection((err,connection) => {

      if (err) {
      res.status(404).json((err));
      return
      }

      let database = connection.config.database + '.';
      connection.query(
      'DELETE FROM ' + database + 'lançamentos WHERE ID=?',
      [req.body.ID],
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

  router.put('/main_table_query_update_CC',function (req, res, next) {
    auth.db_conn().getConnection((err,connection) => {

      if (err) {
      res.status(404).json((err));
      return
      }

      let database = connection.config.database + '.';
      connection.query(
      'UPDATE ' + database + 'lançamentos SET CC = ? WHERE CC = ?',
      [req.body.new,
       req.body.old],
       (error) => {
        if (error) {
          console.log(error)
          res.status(500).json({status: 'error'});
        } else {
          res.status(200).json({status: 'ok'});
        }
       }
    )
    connection.release();
  });
  });

  router.put('/update_done_state_true/:ID',function (req, res, next) {
    auth.db_conn().getConnection((err,connection) => {

      if (err) {
      res.status(404).json((err));
      return
      }

      let database = connection.config.database + '.';
      connection.query(
      'INSERT INTO ' + database + 'historico SELECT * FROM ' + database + 'lançamentos WHERE ID = ?',
      [req.body.ID],

       (error) => {
        if (error) {
          console.log(error)
        } else {
          connection.query(
          'UPDATE ' + database + 'lançamentos SET Valor = ?,Data_Entrada = ?, Vencimento = ?, Concluido = ? WHERE ID = ?',
          [req.body.Valor,
           new Date(req.body.Data_Entrada),
           new Date(req.body.Vencimento),
           req.body.Concluido,
           req.body.ID],
           (error) => {
            if (error) {
              console.log(error)
              res.status(500).json({status: 'error'});
            } else {
              res.status(200).json({status: 'ok'});
            }
          });
        }
       }

      )
      connection.release();
    });
    });


  router.put('/main_table_query_update_div_CC',function (req, res, next) {
    auth.db_conn().getConnection((err,connection) => {

      if (err) {
      res.status(404).json((err));
      return
      }

      let database = connection.config.database + '.';
      connection.query(
      'UPDATE ' + database + 'lançamentos SET Div_CC = ? WHERE Div_CC = ?',
      [req.body.new,
       req.body.old],
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


  router.put('/main_table_query_update_Pessoa',function (req, res, next) {
    auth.db_conn().getConnection((err,connection) => {

      if (err) {
      res.status(404).json((err));
      return
      }

      let database = connection.config.database + '.';
      connection.query(
      'UPDATE ' + database + 'lançamentos SET Pessoa = ? WHERE Pessoa = ?',
      [req.body.new,
       req.body.old],
       (error) => {
        if (error) {
          console.log(error)
          res.status(500).json({status: 'error'});
        } else {
          res.status(200).json({status: 'ok'});
        }
       }
      )
      connection.release();
    });
  });

  router.put('/main_table_query/:ID', function (req, res, next) {
    auth.db_conn().getConnection((err,connection) => {

      if (err) {
      res.status(404).json((err));
      return
      }

      let database = connection.config.database + '.';
      connection.query(
      'UPDATE ' + database + 'lançamentos SET `Descricao` = ?,`Data_Entrada`=?, `CC` = ?, `Div_CC` = ?, `Vencimento` = ?,`Valor` = ?, `Observacao` = ?,`Tipo` = ?, `N_Invest`=?, `Pessoa`=?, `Responsavel`=?, `Concluido`=?, `Imposto`=?, `Tipo_despesa`=?  WHERE `ID`=?',
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
        req.body.Tipo_despesa,
        req.body.ID],
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
module.exports = aux_query_router;
