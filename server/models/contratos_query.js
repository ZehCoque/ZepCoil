const express = require('express');
const auth = require('./auth.js');
const query_builder = require('./query_builder.js')

function contratos_router() {

  const router = express.Router();

    router.post('/contratos_query_get/:Identificacao', function (req, res, next) {
      auth.db_conn().getConnection((err,connection) => {

        if (err) {
      res.status(404).json((err));
      return
      }

        let database = connection.config.database + '.';
        connection.query(
        'SELECT * FROM ' + database + 'contratos WHERE Identificacao = ?',
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

  router.post('/contratos_query_column/:column', function (req, res, next) {
    auth.db_conn().getConnection((err,connection) => {

      if (err) {
      res.status(404).json((err));
      return
      }

    let query_string = query_builder.filter('WHERE 1=1',req.body.active_filters)

    let database = connection.config.database + '.';
    connection.query(
      'SELECT DISTINCT ' + req.body.column + ' FROM ' + database + 'contratos ' + query_string,
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

  router.post('/contratos_query', function (req, res, next) {
    auth.db_conn().getConnection((err,connection) => {

      if (err) {
      res.status(404).json((err));
      return
      }

      let database = connection.config.database + '.';

    let query_string = query_builder.sort(query_builder.filter('WHERE 1=1',req.body.active_filters),req.body.active_sorts,req.body.dir)

    connection.query(
      'SELECT * FROM ' + database + 'contratos ' + query_string + ' LIMIT 100',
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

  router.post('/contratos_query_insert', (req, res, next) => {
    auth.db_conn().getConnection((err,connection) => {

      if (err) {
      res.status(404).json((err));
      return
      }

      let database = connection.config.database + '.';
      connection.query(
      'INSERT INTO ' + database + 'contratos (`Identificacao`, `Descricao`, `Pessoa`, `Data_inicio`, `Data_termino`, `Valor`, `CC`, `Div_CC`, `Tipo`) VALUES (?,?,?,?,?,?,?,?,?)',
      [
        req.body.Identificacao,
        req.body.Descricao,
        req.body.Pessoa,
        new Date(req.body.Data_inicio),
        new Date(req.body.Data_termino),
        req.body.Valor,
        req.body.CC,
        req.body.Div_CC,
        req.body.Tipo
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

router.get('/max_id_contratos', function (req, res, next) {
  auth.db_conn().getConnection((err,connection) => {

    if (err) {
      res.status(404).json((err));
      return
      }

    let database = connection.config.database + '.';
    connection.query(
    'SELECT MAX(Identificacao) as max_id FROM ' + database + 'contratos',
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
  connection.release();
});
});

router.delete('/contratos_query', function (req, res, next) {
  auth.db_conn().getConnection((err,connection) => {

    if (err) {
      res.status(404).json((err));
      return
      }

    let database = connection.config.database + '.';
    connection.query(
    'DELETE FROM ' + database + 'contratos WHERE Identificacao=?',
    [req.body.Identificacao],
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

router.put('/contratos_query/:Identificacao', function (req, res, next) {
  auth.db_conn().getConnection((err,connection) => {

    if (err) {
      res.status(404).json((err));
      return
      }

    let database = connection.config.database + '.';
    connection.query(
    'UPDATE ' + database + 'contratos SET `Descricao` = ?,`Pessoa` = ?,`Data_inicio` = ?,`Data_termino` = ?,`Valor` = ?,`CC` = ?,`Div_CC` = ?,`Tipo` = ?,  WHERE `Identificacao`=?',
    [
      req.body.Descricao,
      req.body.Pessoa,
      new Date(req.body.Data_inicio),
      new Date(req.body.Data_termino),
      req.body.Valor,
      req.body.CC,
      req.body.Div_CC,
      req.body.Tipo,
      req.body.Identificacao
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

router.get('/contagem_contratos_alerta', function (req, res, next) {
  auth.db_conn().getConnection((err,connection) => {

    if (err) {
      res.status(404).json((err));
      return
      }

    let database = connection.config.database + '.';
    connection.query(
      'SELECT COUNT(delta) as Contagem from ' + database + 'alerta_contratos',
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
    })
  });

router.get('/contratos_alerta', function (req, res, next) {
  auth.db_conn().getConnection((err,connection) => {

    if (err) {
      res.status(404).json((err));
      return
      }

    let database = connection.config.database + '.';
    connection.query(
      'SELECT * FROM ' + database + 'alerta_contratos',
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
    })
  });

return router;
}
module.exports = contratos_router;
