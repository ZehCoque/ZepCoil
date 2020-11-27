const express = require('express');
const auth = require('./auth.js');
const query_builder = require('./query_builder.js')

function lancamentos_router() {

  const router = express.Router();

    router.post('/lancamentos_query/:ID', function (req, res, next) {
      auth.db_conn().getConnection((err,connection) => {

        if (err) {
      res.status(404).json((err));
      return
      }

        let database = connection.config.database + '.';
        connection.query(
        'SELECT * FROM ' + database + 'view_lançamentos WHERE ID = ?',
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

  router.post('/lancamentos_query_column/:column', function (req, res, next) {
    auth.db_conn().getConnection((err,connection) => {

      if (err) {
      res.status(404).json((err));
      return
      }

      let database = connection.config.database + '.';

    let query_string = query_builder.filter('WHERE 1=1',req.body.active_filters)

    connection.query(
      'SELECT DISTINCT ' + req.body.column + ' FROM ' + database + 'view_lançamentos ' + query_string,
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
  })
  connection.release();
  });

  router.post('/lancamentos_query', function (req, res, next) {

    auth.db_conn().getConnection((err,connection) => {

      if (err) {
      res.status(404).json((err));
      return
      }

      let database = connection.config.database + '.';

      let query_string = query_builder.sort(query_builder.filter('WHERE 1=1',req.body.active_filters),req.body.active_sorts,req.body.dir)

      connection.query(
        'SELECT * FROM ' + database + 'view_lançamentos ' + query_string + ' LIMIT 100',
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
module.exports = lancamentos_router;
