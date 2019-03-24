/**
 * Server implementation for the Tron game. The server manages user
 * accounts, tracks who is online, transmits challenges between players
 * and manages the game model for each game that is started.
 *
 * The "main" code loads the required frameworks, sets up the
 * Express middleware for handling API endpoints and WebSocket
 * communication. It then uses middlewares for handling HTTP
 * BasicAuth and serving static files. The application will
 * listen on port 8080.
 *
 * It also loads the API and model modules and intialises them.
 */
let express = require('express');
let app = express();
let bodyParser = require("body-parser");
let expressWs = require('express-ws')(app);
let auth = require('basic-auth');

// require the Tron model and intialise it.
let model = require('./tron_model.js');
let api = require('./tron_api.js');
api.init(new model.TronModel());

// ==================================================
// IMPLEMENT THE API AND WEBSOCKET COMMUNICATION HERE
// ==================================================

app.ws('/game', function(ws, req) {
    ws.on('message', function(msg) {
        handleClientMessage(ws, msg);
    });
});

setInterval( function () {
    updateMe.forEach(function (data) {

        let playerBLue = data.blue;
        let playerYellow = data.yellow;

        if(data.game.hasEnded()){
            let winner = data.game.getWinner();

            if(winner.getColour() === 'b'){
                playerBLue.send(JSON.stringify({'type' : 'end', 'youWin' : true}));
                playerYellow.send(JSON.stringify({'type' : 'end', 'youWin' : false}));
            }
            else if(winner.getColour() === 'y'){
                playerBLue.send(JSON.stringify({'type' : 'end', 'youWin' : false}));
                playerYellow.send(JSON.stringify({'type' : 'end', 'youWin' : true}));
            }
            else if(winner === "Draw"){
                playerBLue.send(JSON.stringify({'type' : 'end', 'youWin' : 'draw'}));
                playerYellow.send(JSON.stringify({'type' : 'end', 'youWin' : 'draw'}));
            }
            removeFinished(data.game);
        }
        else {
            data.game.step();

            playerBLue.send(JSON.stringify({
                'type': 'update', 'x': data.game.getBlueCycle().getX(),
                'y': data.game.getBlueCycle().getY(), 'color': 'blue'
            }));
            playerBLue.send(JSON.stringify({
                'type': 'update', 'x': data.game.getYellowCycle().getX(),
                'y': data.game.getYellowCycle().getY(), 'color': 'yellow'
            }));

            playerYellow.send(JSON.stringify({
                'type': 'update', 'x': data.game.getBlueCycle().getX(),
                'y': data.game.getBlueCycle().getY(), 'color': 'blue'
            }));
            playerYellow.send(JSON.stringify({
                'type': 'update', 'x': data.game.getYellowCycle().getX(),
                'y': data.game.getYellowCycle().getY(), 'color': 'yellow'
            }));
        }
    })
}, 1000);


function removeFinished(game){
    let i = 0;
    updateMe.forEach(function(data){
        if(data.game === game){
            updateMe.splice(i, 1);
            return;
        }
        i++;
    })
}

onlinePlayers = {};
addresses = {};

openGames = {};
updateMe = [];

function handleClientMessage(ws, msg){
    let json = JSON.parse(msg);

    switch(json.type){

        case 'register':
            api.createUser(json, '');
            api.setOnline(json, '');
            break;

        case 'available':
            api.login(json, '');
            onlinePlayers[json.username] = ws;
            addresses[ws] = json.username;
            break;

        case 'challenge':
            let socketA = onlinePlayers[json.player];
            socketA.send(JSON.stringify({'type': 'challenge', 'player':addresses[ws]}));
            break;

        case 'accept':
            let socketB = onlinePlayers[json.player];
            socketB.send(JSON.stringify({'type' : 'accept', 'player': addresses[ws]}));

            socketB.send(JSON.stringify({'type' : 'newGame', 'youPlay': 'blue'}));

            ws.send(JSON.stringify({'type' : 'newGame', 'youPlay': 'yellow'}));

            //starts a new game
            let game = newGame();

            openGames[addresses[ws]] = game;
            openGames[json.player] = game;



            let data = {'blue' : socketB, 'yellow': ws, 'game' : game};
            updateMe.push(data);
            break;

        case 'reject':
            let socketC = onlinePlayers[json.player];
            socketC.send(JSON.stringify({'type' : 'reject', 'player': addresses[ws]}));
            break;

        case 'keyPress':
            let colour = json.color;
            let keycode = json.keycode;
            let gameX = openGames[addresses[ws]];
            keyPressUpdater(colour, keycode, gameX);
            break;
    }
}

function keyPressUpdater(colour, keycode, game){
    if(game !== undefined) {
        let c = undefined;
        let d = undefined;

        if (colour === 'yellow') {
            c = 'y';
        }
        else {
            c = 'b'
        }

        switch (keycode) {

            case 's':
                d = 'up';
                break;

            case 'w':
                d = 'down';
                break;

            case 'd':
                d = 'right';
                break;

            case 'a':
                d = 'left';
                break;
        }

        game.turnCycle(c, d);
    }
}

function newGame(){
    return model.Game.newGame();
}


app.use('/game', express.static(__dirname + '/static'));

// Log any server-side errors to the console and send 500 error code.
app.use(function (err, req, res, next) {
    console.error(err.stack);
    res.status(500).send('Something broke!')
});

app.listen(8080);
console.log('Server running, access game by going to http://127.0.0.1:8080/game/tron.html');


/**
 * Use HTTP BasicAuth to protect API endpoints further down in the
 * pipeline from unauthenticated access. On successful authentication,
 * req.authenticated_user is set to the username of the authenticated
 * user.
 */
function authenticate(req, res, next) {
    let user = auth(req);
    if (user === undefined || pass === undefined) {
        sendAuthRequest(res);
    }
    else {
        if(!model.authenticateUser(user, pass)) {
            sendAuthRequest(res);
        }
        else {
            req.authenticated_user = user;
            next(); // continue processing pipeline
        }
    }
}

/**
 * Send an HTTP BasicAuth authentication request.
 */
function sendAuthRequest(res) {
    res.statusCode = 401;
    res.setHeader('WWW-Authenticate', 'Basic realm="MyRealmName"');
    res.end('Unauthorized');
}
