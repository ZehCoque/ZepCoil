const express = require('express');
const auth = require('./auth.js');

function CC_router() {

  const router = express.Router();

  router.get('/pessoa_query', function (req, res, next) {
    let database = auth.db_conn().config.database + '.';
    auth.db_conn().query(
      'SELECT * FROM ' + database + 'func_forn',
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

  router.post('/pessoa_query_add', function (req, res, next) {
    let database = auth.db_conn().config.database + '.';
    auth.db_conn().query(
      'INSERT INTO ' + database + 'func_forn (`Nome`,`Sobrenome`,`CPF_CNPJ`,`Banco`,`Agencia`,`Conta`,`Tipo`) VALUES (?,?,?,?,?,?,?)',
      [
        req.body.Nome,
        req.body.Sobrenome,
        req.body.CPF_CNPJ,
        req.body.Banco,
        req.body.Agencia,
        req.body.Conta,
        req.body.Tipo,
      ],
      (error, results) => {
        if (error) {
          console.log(error);
          res.status(409).json(error);
        } else {
          res.status(200).json(results);
        }
      }
    );
  });

  router.delete('/pessoa_query_delete', function (req, res, next) {
    let database = auth.db_conn().config.database + '.'
    auth.db_conn().query(
      'DELETE FROM ' + database + 'func_forn WHERE Nome=?',
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
  });

return router;
}
module.exports = CC_router;
