const express = require('express');

function main_pn_info_router(db) {
  const router = express.Router();

// workaround to send get requests with body
router.get('/main_table_query', function (req, res, next) {
  db.query(
    'SELECT * FROM lançamentos ORDER BY id',
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
