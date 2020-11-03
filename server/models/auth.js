const express = require('express');
const db_connection = require('../connection/dbconnection.js');
const mysql = require('mysql');

var db_connection_var; 

var db_connection_status = () => {
  return db_connection_var;
}

function auth_router(connection) {

  const router = express.Router();

    router.post('/users/authenticate', function(req, res) {

     return authenticate(connection, req, res);

    });

    router.post('/users/refresh-token', function(req, res) {
      return refreshToken(connection, req, res) ;
    });

    router.post('/users/revoke-token', function(req, res) {
      return revokeToken(connection, req, res);
    });

    router.get('/users', function(req, res) {
      return getUsers(db_connection_var,req, res);
    });

    router.get('/reconnect', function() {
      db_connection(user.username,user.password).then(dbconnection => {

        db_connection_var = dbconnection;
        return;
      })
    });


  return router;

  }

  function authenticate(connection, req, res) {

    get_user(connection, req, res).then((user) => {

      if (user === undefined) return error(res,'Username or password is incorrect');
      // add refresh token to user
      update_user(connection, req, res, generateRefreshToken(res)).then(() => {

        db_connection(user.username,user.password).then(dbconnection => {

          db_connection_var = dbconnection;

          return ok({
            id: user.id,
            username: user.username,
            firstName: user.firstName,
            lastName: user.lastName,
            jwtToken: generateJwtToken()
        }, res)

        }).catch(err => console.log(err));

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
          reject(error);
        }

        if (results){
          if (results.length == 0) {
            resolve();
          } else {
            resolve(JSON.parse(JSON.stringify(results[0])));
          }
        }

      })
  	});

}

function getUserByRefreshToken(connection, refreshToken) {

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

function delete_token(connection, username, refreshToken) {
  return new Promise(function(resolve, reject) {
    connection.query(
      'UPDATE `accounts`.`account_info` SET `refreshToken` = NULL WHERE (`refreshToken` = ?) and (`username` = ?);',
      [refreshToken,username],
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

    getUserByRefreshToken(connection, refreshToken).then((user) => {
      if (user === undefined) return unauthorized(res);

      // replace old refresh token with a new one and save

      update_user(connection, req, res,getRefreshToken(req)).then(() => {

        db_connection(user.username,user.password).then(dbconnection => {

          db_connection_var = dbconnection;

          return ok({
            id: user.id,
            username: user.username,
            firstName: user.firstName,
            lastName: user.lastName,
            jwtToken: generateJwtToken()
        }, res)

        }).catch(err => console.log(err));

      }).catch(err => console.log(err));

    }).catch(err => console.log(err));

}

function revokeToken(connection, req, res) {
    if (!isLoggedIn(req)) return unauthorized(res);

    const refreshToken = getRefreshToken(req);
    getUserByRefreshToken(connection,refreshToken).then((user) => {
      delete_token(connection,user.username,refreshToken).then(() => {
        return ok({}, res)
      })
    }).catch(err => console.log(err));;


}

function getUsers(connection,req,res) {

    var auth_connection = mysql.createConnection({
      connectionLimit : 10,
      host            : 'localhost',
      user            : connection.config.username,
      password        : connection.config.password,
      database        : 'authenticator',
    });

    let promise = new Promise((resolve,reject) => {
      auth_connection.connect(function(err) {
      console.error('Trying connection to ' + auth_connection.config.host + ' as ' + auth_connection.config.user);
      if (err) {
      console.error('Error connecting to remote database: ' + err);
      reject(err);
      }
      console.log('Connected to REMOTE DATABASE as ' + auth_connection.config.user);
      resolve();
    });
    });

    if (!isLoggedIn(req)) return unauthorized(res);

    var user_list = [];
    var p = new Promise(function(resolve, reject) {
      auth_connection.query(
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

      promise.then(() => {
        p.then(async (users) => {
          await users.forEach(user => {
            user_list.push(user.username);
          })
          auth_connection.destroy();
        })
      }).catch(err => console.log(err))


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

function isLoggedIn(req) {
    // check if jwt token is in auth header
    const authHeader = req.headers.authorization;
    if (!authHeader.startsWith('Bearer jwt-token')) return false;

    // check if token is expired
    const jwtToken = JSON.parse(authHeader.split('.')[1]);
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

module.exports = {
  auth_router: auth_router,
  db_conn: db_connection_status
};
