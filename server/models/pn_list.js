const express = require('express');

function pn_list_router(db) {
  const router = express.Router();

router.post('/pn_list', (req, res, next) => {
  db.query(
    'INSERT INTO pn_list VALUES (?,?)',
    [req.body.value, new Date (req.body.timestamp)],
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

router.get('/pn_list', function (req, res, next) {
  db.query(
    'SELECT * FROM pn_list order by Timestamp',
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


router.delete('/pn_list/:Timestamp', function (req, res, next) {

  db.query(
    'DELETE FROM pn_list WHERE Timestamp=?',
    [new Date(req.body.timestamp)],
    (error) => {
      if (error) {
        res.status(500).json({status: 'error'});
      } else {
        res.status(200).json({status: 'ok'});
      }
    }
  );
});


router.put('/pn_list/:Timestamp', function (req, res, next) {
  db.query(
    'UPDATE pn_list SET PN=? WHERE Timestamp=?',
    [req.body.value, new Date(req.body.timestamp)],
    (error) => {
      if (error) {
        res.status(500).json({status: 'error'});
      } else {
        res.status(200).json({status: 'ok'});
      }
    }
  );
});

  return router;
}

module.exports = pn_list_router;
