const express = require('express');

function fake_nf_server_router(db) {
  const router = express.Router();

// workaround to send get requests with body
router.post('/fake_nf_server/:NF', function (req, res, next) {
  if (req.body.check){
    next();
  } else {
    db.query(
      'SELECT main_pn_info.PN,Description,PackageType,SupplierName FROM fake_nf_server INNER JOIN main_pn_info ON fake_nf_server.PN = main_pn_info.PN WHERE NF=?',
      [req.body.value],
      (error, results) => {
        if (error) {
          console.log(error);
          res.status(500).json({status: 'error'});
        } else {
          res.status(200).json(results);
        }
      }
    );
  }
}, function (req, res, next) {
  db.query(
    'SELECT NF FROM fake_nf_server WHERE NF = ?',
    [req.body.value],
    (error,results) => {
      if (error || results.length === 0) {
        res.status(500).json({status: 'error'});
      } else {
        res.status(200).json(results);
      }
      next();
    }
  )
});

return router;
}
module.exports = fake_nf_server_router;
