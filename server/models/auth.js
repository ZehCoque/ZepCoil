const express = require('express');

function auth_router(connection) {

  const router = express.Router();

    router.post('/users/authenticate', function(req, res) {

     return authenticate(connection, req, res);

    });

    router.post('/users/refresh-token', function(req, res) {
      refreshToken(connection, req, res) ;
    });

    router.post('/users/revoke-token', function(req, res) {
      revokeToken(connection, req, res);
    });

    router.get('/users', function(req, res) {
      getUsers(connection, res);
    });


  return router;

  }

  function authenticate(connection, req, res) {

    get_user(connection, req, res).then((user) => {

      if (user === undefined) return error(res,'Username or password is incorrect');
      // add refresh token to user
      update_user(connection, req, res, generateRefreshToken(res)).then(() => {
        return ok({
          id: user.id,
          username: user.username,
          firstName: user.firstName,
          lastName: user.lastName,
          jwtToken: generateJwtToken()
      }, res)
      }).catch(err => console.log(err));

    }).catch(err => console.log(err));

}

function get_user(connection, req, res) {

  return new Promise(function(resolve, reject) {
    connection.query(
      'SELECT * FROM account_info WHERE username = ? AND password = ?',
      [req.body.username, req.body.password],
      (error, results) => {
        if (error){
          return reject(error);
        }
        if (results.length == 0) {
          resolve();
        } else {
          resolve(JSON.parse(JSON.stringify(results[0])));
        }
      })
  	});

}

function login_by_refresh_token(connection, refreshToken) {

  return new Promise(function(resolve, reject) {
    connection.query(
      'SELECT * FROM account_info WHERE refreshToken = ?',
      [refreshToken],
      (error, results) => {
        if (error){
          return reject(error);
        }
        if (results.length == 0) {
          resolve();
        } else {
          resolve(JSON.parse(JSON.stringify(results[0])));
        }
      })
  	});

}

function update_user(connection, req, res, refreshToken) {

  return new Promise(function(resolve, reject) {
    connection.query(
      'UPDATE `account_info` SET `refreshToken` = ? WHERE `username` = ?;',
      [refreshToken,req.body.username],
      (error, results) => {
        if (error) {
          return reject(error);
        }
        if (results.affectedRows == 0) {
          resolve('No rows affected');;
        } else {
          resolve();
        }
      }
    );
  });
}

function refreshToken(connection, req, res) {
    const refreshToken = getRefreshToken(req);
    if (!refreshToken) return unauthorized(res);

    login_by_refresh_token(connection, refreshToken).then((user) => {
      if (user === undefined) return unauthorized(res);

      // replace old refresh token with a new one and save

      update_user(connection, req, res,getRefreshToken(req)).then(() => {
        return ok({
          id: user.id,
          username: user.username,
          firstName: user.firstName,
          lastName: user.lastName,
          jwtToken: generateJwtToken()
      },res)
      }).catch(err => console.log(err));

    }).catch(err => console.log(err));

}

function revokeToken(connection, req, res) {
    if (!isLoggedIn()) return unauthorized(res);

    get_user(connection, req, res).then((user) => {
      // revoke token and save
      update_user(connection, req, res,'').then(() => {
        return ok({}, res);
      }).catch(err => console.log(err));

    }).catch(err => console.log(err));

}

function getUsers(connection,res) {
    if (!isLoggedIn()) return unauthorized(res);

    var user_list = [];
    var p = new Promise(function(resolve, reject) {
      connection.query(
        'SELECT * FROM account_info',
        [],
        (error, results) => {
          if (error){
            return reject(error);
          }
          if (results.length == 0) {
            resolve();
          } else {
            resolve(JSON.parse(JSON.stringify(results[0])));
          }
        })
      });

      p.then(users => {
        users.forEach(user => {
          user_list.push(user.username);
        })
      })

    return ok(user_list, res);
}

// helper functions

function ok(body, res) {
    return res.status(200).json(body);
}

function error(res, message) {
    return res.status(404).json({error: { message: message } })
}

function unauthorized(res) {
    return res.status(401).json({error: { message: 'Unauthorized' } });
}

function isLoggedIn() {
    // check if jwt token is in auth header
    const authHeader = headers.get('Authorization');
    if (!authHeader.startsWith('Bearer jwt-token')) return false;

    // check if token is expired
    const jwtToken = JSON.parse(atob(authHeader.split('.')[1]));
    const tokenExpired = Date.now() > (jwtToken.exp * 1000);

    if (tokenExpired) return false;

    return true;
}

function generateJwtToken() {
    // create token that expires in 15 minutes
    const tokenPayload = { exp: Math.round(new Date(Date.now() + 15*60*1000).getTime() / 1000) }
    return `jwt-token.${JSON.stringify(tokenPayload).toString('base64')}`;
}

function generateRefreshToken(res) {
    const token = new Date().getTime().toString();

    // add token cookie that expires in 7 days
    res.cookie('refreshToken', token, {maxAge: 7*24*60*60*1000});
    return token;
}

function getRefreshToken(req) {
    // get refresh token from cookie
    if (req.cookies !== undefined) return req.cookies.refreshToken;
}

module.exports = auth_router;
