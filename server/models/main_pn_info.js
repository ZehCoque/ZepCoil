const express = require('express');

function main_pn_info_router(db) {
  const router = express.Router();

// workaround to send get requests with body
router.post('/main_pn_info/:PN', function (req, res, next) {
  db.query(
    'SELECT * FROM main_pn_info WHERE PN=?',
    [req.body.value],
    (error, results) => {
      if (error || results.length === 0) {
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
