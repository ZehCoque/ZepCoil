const express = require('express');
const auth = require('./auth.js');

const database = 'zepcoil.'

function views_router() {

  const router = express.Router();

  router.post('/total_receitas', function (req, res, next) {

    let DATAI = req.body.DATAI.substring(0,10);
    let DATAF = req.body.DATAF.substring(0,10);

    console.log('CALL SOMAR(' + DATAI + ',' + DATAF + ')')

    auth.db_conn().query(
      'CALL SOMAR(?,?)',
      [DATAI, DATAF],
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

    let DATAI = req.body.DATAI.substring(0,10);
    let DATAF = req.body.DATAF.substring(0,10);

    auth.db_conn().query(
      'CALL SOMAD(?,?)',
      [DATAI, DATAF],
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

    let DATAI = req.body.DATAI.substring(0,10);
    let DATAF = req.body.DATAF.substring(0,10);

    auth.db_conn().query(
      'CALL SOMAI(?,?)',
      [DATAI,DATAF],
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

  router.post('/max_min_dates', function (req, res, next) {
    let query_string = 'WHERE 1=1';

    let active_filters = req.body.active_filters;

    for (var key in active_filters) {
      if (active_filters.hasOwnProperty(key)) {
          if (active_filters[key] !== ''){
            let value;
            if (key === 'Data_Entrada' || key === 'Vencimento'){
              value = active_filters[key].substring(0,10);
            }else {
              value = active_filters[key];
            }
            query_string = query_string + ' AND ' + key + ' = \'' + value + '\'';
          }
      }
    }

    auth.db_conn().query(
      'Select MAX(Data_Entrada) as DATAF, MIN(Data_Entrada) as DATAI from ' + database + 'lançamentos ' + query_string,
      [],
      (error, results) => {
        if (error) {
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
