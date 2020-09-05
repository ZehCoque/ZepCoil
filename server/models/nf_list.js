const express = require('express');

function nf_list_router(db) {
  const router = express.Router();

router.post('/nf_list', (req, res, next) => {
  db.query(
    'INSERT INTO nf_list VALUES (?,?)',
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

router.get('/nf_list', function (req, res, next) {
  db.query(
    'SELECT * FROM nf_list order by Timestamp',
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


router.delete('/nf_list/:Timestamp', function (req, res, next) {
  console.log(new Date(req.body.timestamp));
  db.query(
    'DELETE FROM nf_list WHERE Timestamp=?',
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


router.put('/nf_list/:Timestamp', function (req, res, next) {
  db.query(
    'UPDATE nf_list SET NF=? WHERE Timestamp=?',
    [req.body.value, new Date(req.body.timestamp)],
    (error) => {
      if (error) {
        console.log(error);
        res.status(500).json({status: 'error'});
      } else {
        res.status(200).json({status: 'ok'});
      }
    }
  );
});

  return router;
}

module.exports = nf_list_router;
