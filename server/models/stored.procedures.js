const express = require('express');
const auth = require('./auth.js');
const query_builder = require('./query_builder.js')

function views_router() {

  const router = express.Router();

  router.post('/total_receitas', function (req, res, next) {
    let database = auth.db_conn().config.database + '.'
    req.body.active_filters.Tipo = '';
    let query_string = query_builder.filter('WHERE Tipo = \'0\'',req.body.active_filters);

    let query_view;
    if (req.body.state == 1){
      query_view = 'view_lançamentos'
    } else {
      query_view = 'view_terceiros'
    }

    auth.db_conn().query(
      'Select SUM(Valor) AS TOTALR from ' + database + query_view + ' ' + query_string,
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

  router.post('/total_despesas', function (req, res, next) {
    let database = auth.db_conn().config.database + '.'
    req.body.active_filters.Tipo = '';
    let query_string = query_builder.filter('WHERE Tipo = \'1\'',req.body.active_filters);

    let query_view;
    if (req.body.state == 1){
      query_view = 'view_lançamentos'
    } else {
      query_view = 'view_terceiros'
    }

    auth.db_conn().query(
      'Select SUM(Valor) AS TOTALD from ' + database + query_view + ' ' + query_string,
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

  router.post('/total_investimentos', function (req, res, next) {
    let database = auth.db_conn().config.database + '.'
    req.body.active_filters.Tipo = '';
    let query_string = query_builder.filter('WHERE Tipo = \'2\'',req.body.active_filters);

    let query_view;
    if (req.body.state == 1){
      query_view = 'view_lançamentos'
    } else {
      query_view = 'view_terceiros'
    }

    auth.db_conn().query(
      'Select SUM(Valor) AS TOTALI from ' + database + query_view + ' ' + query_string,
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
module.exports = views_router;
