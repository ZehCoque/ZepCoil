const express = require('express');
const auth = require('./auth.js');
const query_builder = require('./query_builder.js')

function terceiros_router() {

  const router = express.Router();

    router.post('/terceiros_query/:ID', function (req, res, next) {
      let database = auth.db_conn().config.database + '.'
      auth.db_conn().query(
        'SELECT * FROM ' + database + 'view_terceiros WHERE ID = ?',
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

  router.post('/terceiros_query_column/:column', function (req, res, next) {
    let database = auth.db_conn().config.database + '.'

    let query_string = query_builder.filter('WHERE 1=1',req.body.active_filters)

    auth.db_conn().query(
      'SELECT DISTINCT ' + req.body.column + ' FROM ' + database + 'view_terceiros ' + query_string,
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

  router.post('/terceiros_query', function (req, res, next) {
    let database = auth.db_conn().config.database + '.'

    let query_string = query_builder.sort(query_builder.filter('WHERE 1=1',req.body.active_filters),req.body.active_sorts,req.body.dir)

    auth.db_conn().query(
      'SELECT * FROM ' + database + 'view_terceiros ' + query_string,
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
module.exports = terceiros_router;
