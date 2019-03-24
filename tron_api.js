/**
 * API for the Tron game. Handles requests concerning users.
 */

let model = undefined;
let api = exports;

// =============================
// YOUR API IMPLEMENTATION HERE.
// =============================

api.createUser = function (req, res) {
    let username = req.username;
    let password = req.password;
    try {
        let user = model.addUser(username, password);
        res.statusCode = 201;
        res.data = JSON.stringify(api.formatUserInfo(user));
        return res;
    }
    catch (e){
        return res.statusCode = 405;
    }
};

api.setOnline = function(req, res){
    let username = req.username;
    let user = model.getUser(username);
    user.setOnline(true);
};

api.setOffline = function(req, res){
    let username = req.username;
    let user = model.getUser(username);
    user.setOnline(false);
};

api.login = function (req, res) {
  if(model.authenticateUser(req.username, req.password)){
      api.setOnline(req, res);
  }
  else{
      console.log("LOGIN FAILED");
  }
};

api.removeUser = function(req, res){
    let username = req.username;
    model.deleteUser(username);
};

api.getUsers = function (req, res) {
    res.statusCode = 200;
    let users = model.getUsers();
    let usersFormatted = [];

    for(let i = 0; i < users.length; i++){
        usersFormatted.push(api.formatUserInfo(users[i]))
    }

    res.data = JSON.stringify(usersFormatted);
    return res;
};

api.getUser = function (req, res) {
    let user = model.getUser(req.username);

    if (user === undefined) {
        res.statusCode = 404;
        return res;
    }
    else {
        res.statusCode = 200;
        res.data = api.formatUserInfo(user);
        return res;
    }
};

api.formatUserInfo = function (user) {
      let formatted = {"username" : undefined, "online" : undefined};
      formatted.username = user.username;
      formatted.online = user.online;
      return formatted;
};


/**
 * Initialise the API by setting the reference to the model
 * that is to be used (dependency injection).
 */
api.init = function(modelArg) {
    model = modelArg;
};
