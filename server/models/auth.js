const express = require('express');

class Users {
  constructor(username, password, firstName, lastName, refreshToken = '') {
    this.username = username;
    this.password = password,
    this.firstName = firstName;
    this.lastName = lastName;
    this.refreshToken = refreshToken;
  }
}

function auth_router(connection) {

  const router = express.Router();

    router.post('/users/authenticate', function(req, res) {

     return authenticate(connection, req, res);

    });

    router.post('/users/refresh-token', function(req, res) {
      refreshToken(connection, req, res) ;
    });

    router.post('/users/revoke-token', function(req, res) {});

    router.get('/users', function(req, res) {});


  return router;

  }

  function authenticate(connection, req, res) {

    var user = new Users;

    connection.query(
      'SELECT * FROM account_info WHERE username = ? AND password = ?',
      [req.body.username, req.body.password],
      (error, results) => {
        if (error) {
          console.log(error);
          res.status(500).json({status: 'error'});
        } else {
          user = results;
        }
      }
    );
      console.log(user)
    if (user.length == 0) return error('Username or password is incorrect');
      console.log(user.username)
    // add refresh token to user
    connection.query(
      'UPDATE `account_info` SET `refreshToken` = ? WHERE `username` = ?;',
      [generateRefreshToken(res),user.username],
      (error, results) => {
        if (error) {
          console.log(error);
          res.status(500).json({status: 'error'});
        } else {
          user = results;
        }
      }
    );

    return ok({
        id: user.id,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        jwtToken: generateJwtToken()
    }, res)
}

function refreshToken(connection, req, res) {
    const refreshToken = getRefreshToken(req);

    if (!refreshToken) return unauthorized(res);

    const user = new Users;

    connection.query(
      'SELECT * FROM account_info WHERE username = ? AND password = ?',
      [req.body.username, req.body.password],
      (error, results) => {
        console.log(results);
        if (error) {
          console.log(error);
          res.status(500).json({status: 'error'});
        } else {
          user = results;
        }
      }
    );

    if (user.length == 0) return unauthorized(res);

    // replace old refresh token with a new one and save
    connection.query(
      'UPDATE `accounts`.`account_info` SET `refreshToken` = ? WHERE `username` = ?;',
      [generateRefreshToken(res),user],
      (error, results) => {
        console.log(results);
        if (error) {
          console.log(error);
          res.status(500).json({status: 'error'});
        } else {
          user = results.user;
        }
      }
    );

    return ok({
        id: user.id,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        jwtToken: generateJwtToken()
    },res)
}

function revokeToken() {
    if (!isLoggedIn()) return unauthorized(res);

    const refreshToken = getRefreshToken(req);

    connection.query(
      'SELECT * FROM account_info WHERE refreshToken = ?',
      [refreshToken],
      (error, results) => {
        console.log(results);
        if (error) {
          console.log(error);
          res.status(500).json({status: 'error'});
        } else {
          user = results;
        }
      }
    );

    // revoke token and save
    user.refreshTokens = user.refreshTokens.filter(x => x !== refreshToken);
    localStorage.setItem(usersKey, JSON.stringify(users));

    return ok({}, res);
}

function getUsers(res) {
    if (!isLoggedIn()) return unauthorized(res);
    return ok(users, res);
}

// helper functions

function ok(body, res) {
    return res.status(200).json(body);
}

function error(res, message) {
    return res.status(401).json({error: { message: message } })
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
    const expires = new Date(Date.now() + 7*24*60*60*1000).toUTCString();
    res.cookie = `refreshToken=${token}; expires=${expires}; path=/`;

    return token;
}

function getRefreshToken(req) {
    // get refresh token from cookie
    if (req.cookie !== undefined) return (req.cookie.split(';').find(x => x.includes('refreshToken')) || '=').split('=')[1];
}


module.exports = auth_router;
