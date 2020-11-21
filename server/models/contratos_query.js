const express = require('express');
const auth = require('./auth.js');
const query_builder = require('./query_builder.js')

function contratos_router() {

  const router = express.Router();

    router.post('/contratos_query_get/:ID', function (req, res, next) {
      let database = auth.db_conn().config.database + '.'
      auth.db_conn().query(
        'SELECT * FROM ' + database + 'contratos WHERE ID = ?',
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
      'INSERT INTO ' + database + 'contratos (`Descricao`, `Pessoa`, `Data_inicio`, `Data_termino`, `Valor`, `CC`, `Div_CC`, `Tipo`, `PCoil`, `PZep`,`PComissao`) VALUES (?,?,?,?,?,?,?,?,?,?,?)',
      [
        req.body.Descricao,
        req.body.Pessoa,
        new Date(req.body.Data_inicio),
        new Date(req.body.Data_termino),
        req.body.Valor,
        req.body.CC,
        req.body.Div_CC,
        req.body.Tipo,
        req.body.PCoil,
        req.body.PZep,
        req.body.PComissao
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

router.put('/contratos_query/:ID', function (req, res, next) {
  let database = auth.db_conn().config.database + '.'
  auth.db_conn().query(
    'UPDATE ' + database + 'contratos SET `Descricao` = ?,`Pessoa` = ?,`Data_inicio` = ?,`Data_termino` = ?,`Valor` = ?,`CC` = ?,`Div_CC` = ?,`Tipo` = ?,`PZep` = ?,`PCoil` = ?, `PComissao` = ?  WHERE `ID`=?',
    [
      req.body.Descricao,
      req.body.Pessoa,
      new Date(req.body.Data_inicio),
      new Date(req.body.Data_termino),
      req.body.Valor,
      req.body.CC,
      req.body.Div_CC,
      req.body.Tipo,
      req.body.PCoil,
      req.body.PZep,
      req.body.PComissao,
      req.body.ID
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
});

return router;
}
module.exports = contratos_router;
