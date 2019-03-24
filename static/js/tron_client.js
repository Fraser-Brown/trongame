/**
 * tron_client.js
 *
 * Client-side part of the implementation of the Tron Light Cycle game.
 *
 */

var ws;

var myColour;

document.addEventListener('keypress', function (event){
    keypress(event.key);
});

var canvas, ctx;
var tron = (function(){

    const width = 500;
    const height = 500;
    const margin = 4;



    function init() {
        canvas = $("#canvas")[0];
        canvas.width = width + (2*margin);
        canvas.height = height + (2*margin);
        ctx = canvas.getContext("2d");
        clear();
        ws = new WebSocket('ws://localhost:8080/game');
        ws.onmessage = recieveFromServer;
    }

    /**
     * Clear the canvas.
     */
    function clear() {
        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        drawBackground();
        drawGrid();
        drawBorder();
    }

    /**
     * Draw a dark blue background.
     */
    function drawBackground() {
        ctx.fillStyle = "#00008B";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    /**
     * Draw a grid at every 10 pixels.
     */
    function drawGrid() {
        ctx.beginPath();
        ctx.lineWidth = 1;
        ctx.strokeStyle = "#6495ED";
        for(var i = 20 + margin; i < canvas.width - margin; i += 20) {
            ctx.moveTo(i,margin);
            ctx.lineTo(i, canvas.height - margin);
            ctx.moveTo(margin, i);
            ctx.lineTo(canvas.width + margin, i);
        }
        ctx.stroke();
    }

    /**
     * Draw a border to delineate the arena.
     */
    function drawBorder() {
        ctx.beginPath();
        ctx.lineWidth = margin;
        ctx.strokeStyle = "#6495ED";
        ctx.moveTo(2,2);
        ctx.lineTo(canvas.width - 2, 2);
        ctx.lineTo(canvas.width - 2, canvas.height - 2);
        ctx.lineTo(2, canvas.height - 2);
        ctx.lineTo(2, 2);
        ctx.stroke();
    }

    return {
        init: init
    }

})();

function register(username, password){
    let msg = {'type' : 'register', 'username' : username, 'password' : password};
    ws.send(JSON.stringify(msg));
}

function login(username, password){
    let msg = {'type' : 'available', 'username' : username, 'password' : password};
    ws.send(JSON.stringify(msg));
}

function challenge(username){
    let msg = {'type' : 'challenge', 'player' : username};
    ws.send(JSON.stringify(msg));
}

function recieveFromServer(msg){
    let type = JSON.parse(msg.data).type;

    switch (type){
        case 'challenge':
            dealWithChallenge(msg);
            break;

        case 'accept':
            console.log('game accepted');
            break;

        case 'reject':
            console.log('game rejected');
            break;

        case 'newGame':
            console.log(JSON.parse(msg.data).youPlay);
            gameStarting(msg);
            break;

        case 'update':
            drawTron(JSON.parse(msg.data).x * 5, JSON.parse(msg.data).y * 5, JSON.parse(msg.data).color);
            break;

        case'end':
            if(JSON.parse(msg.data).youWin === true){
                $('#postScript').append('<p> You Win </p>')
            }

            else if(JSON.parse(msg.data).youWin === false){
                $('#postScript').append('<p> You Lose </p>')
            }

            else if(JSON.parse(msg.data).youWin === 'draw'){
                $('#postScript').append('<p> A Draw </p>')
            }
            break;
    }

}

function dealWithChallenge(msg){
    player = JSON.parse(msg.data).player;

    $('#postScript').append('<p> Player ' + player + ' has challenged you </p>' +
        '<button onclick="acceptChallenge(player)"> accept </button>' +
        '<button onclick="rejectChallenge(player)"> reject </button>');
}

function acceptChallenge(player) {
    let accept = {'type' : 'accept', 'player' : player};
    ws.send(JSON.stringify(accept));
    $('#postScript').remove();
}

function rejectChallenge(player) {
    let reject = {'type' : 'reject', 'player' : player};
    ws.send(JSON.stringify(reject));
    $('#postScript').remove();
}

function gameStarting(msg){
    myColour = JSON.parse(msg.data).youPlay;
}

function keypress(key){
    let keyPressed = {'type' : 'keyPress', 'keycode' : key, 'color' : myColour};
    ws.send(JSON.stringify(keyPressed));
}

function drawTron(x,y, colour){
    if(colour === 'yellow') {
        ctx.fillStyle = "#ffff00";
        ctx.fillRect(x, y, 20, 20);
    }
    else if (colour === 'blue'){
        ctx.fillStyle = "#9df3ff";
        ctx.fillRect(x, y, 20, 20);
    }
}