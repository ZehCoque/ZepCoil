const express = require('express');

function auth_router(connection) {
  const router = express.Router();
    router.post('/auth', function(req, res) {
      var username = req.body.username;
      var password = req.body.password;
      if (username && password) {
        connection.query('SELECT * FROM accounts WHERE username = ? AND password = ?', [username, password],
         function(error, results) {
          if (results.length > 0 && !error) {
            req.session.loggedin = true;
            req.session.username = username;
            res.status(200).json({status: 'LOGIN SUCCESS'});
          } else {
            res.status(500).json({status: 'LOGIN ERROR'});
          }
          response.end();
        });
      }
    });
  return router;
  }
module.exports = auth_router;
