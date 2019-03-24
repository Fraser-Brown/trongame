/**
 * Model for the Tron game.
 *
 * This code is Node.js specific as the model is kept
 * on the server side.
 */

let model = exports;

// =======================
// IMPLEMENT THESE CLASSES
// =======================

model.Grid = class {
    constructor(){
        this.grid = new Array(100);
        for(let i = 0; i < 100; i++){
            this.grid[i] = new Array(100);
        }
    }

    set(x,y, colour){
        if(x < 1 || y < 1 || x > 99 || y > 99){
            throw Error;
        }
        else if (this.grid[x][y] !== undefined){
            throw Error;
        }
        this.grid[x][y] = colour;
    }

    get(x,y){
        return this.grid[x][y];
    }
};

model.Cycle = class {

    constructor(colour, xPos, yPos, direction){
        if(colour === 'b'){
            this.setY(99);
            this.setDirection('down');
        }
        if(colour === 'y'){
            this.setY(1);
            this.setDirection('up');
        }

        this.setX(50);

        if(xPos !== undefined) {
            this.setX(xPos);
        }
        if(yPos !== undefined) {
            this.setY(yPos);
        }
        if(direction !== undefined) {
            this.setDirection(direction);
        }
        this._colour = colour;
    }


    getColour() {
        return this._colour;
    }

    getX() {
        return this._xPosition;
    }

    getY() {
        return this._yPosition;
    }

    setX(value) {
        this._xPosition = value;
    }

    setY(value) {
        this._yPosition = value;
    }

    setDirection(direction){
        this.direction = direction;
    }

    getDirection(){
        return this.direction;
    }

    setHasCrashed(hasCrashed){
        this.hasCrashed = hasCrashed;
    }

    getHasCrashed(){
        return this.hasCrashed;
    }

    stepCycle(){
        switch (this.getDirection()){
            case 'up':
                this.setY(this.getY() + 1);
                break;

            case 'down':
                this.setY(this.getY() - 1);
                break;

            case 'left':
                this.setX(this.getX() - 1);
                break;

            case 'right':
                this.setX(this.getX() + 1);
                break;
        }
    }
};

model.Game = class {

    constructor(grid, bCycle, yCycle) {
        if(bCycle === undefined) {
            this.b = new model.Cycle('b');
        }
        else{
            this.b = bCycle;
        }
        if(yCycle === undefined) {
            this.y = new model.Cycle('y');
        }
        else{
            this.y = yCycle;
        }
        if(grid === undefined) {
            this.grid = new model.Grid();
        }
        else{
            this.grid = grid;
        }
        this.ended = false;
        this.winner = undefined;

        this.grid.set(this.y.getX(), this.y.getY(), this.y.getColour());
        this.grid.set(this.b.getX(), this.b.getY(), this.b.getColour());
    }

    static newGame(){
        return new model.Game();
    }

    getBlueCycle() {
        return this.b;
    }

    getYellowCycle() {
        return this.y;
    }

    getGrid() {
        return this.grid;
    }

    get(x,y){
        return this.grid.get(x,y);
    }

    hasEnded(){
        return this.ended;
    }

    getWinner(){
        return this.winner;
    }

    step(){
        try {
            this.b.stepCycle();
            this.grid.set(this.b.getX(), this.b.getY(), this.b.getColour());
        }
        catch (e){
            this.b.setHasCrashed(true);
        }
        try {
            this.y.stepCycle();
            this.grid.set(this.y.getX(), this.y.getY(), this.y.getColour());
        }
        catch(e){
           this.y.setHasCrashed(true);
        }

        finally{
            if(this.b.getX() === this.y.getX() && this.b.getY() === this.y.getY()){
                this.winner = "Draw";
                this.ended = true;
            }
            else if(this.b.getHasCrashed() && this.y.getHasCrashed()){
               this.winner = "Draw";
               this.ended = true;
            }
            else if(this.b.getHasCrashed()){
                this.winner = this.y;
                this.ended = true
            }
            else if (this.y.getHasCrashed()){
               this.winner = this.b;
               this.ended = true;
            }
        }
    }

    turnCycle(cycle, direction){
        var tron;
        if (cycle === "y"){
            tron = this.getYellowCycle();
        }
        else if (cycle === "b"){
            tron = this.getBlueCycle();
        }
        tron.setDirection(direction);
    }
};

model.User = class {
    constructor(username, password){
        this.username = username;
        this.password = password;
        this.online = false;
    }

    getUsername() {
        return this.username;
    }

    getPassword() {
        return this.password;
    }

    getOnline(){
        return this.online;
    }

    setOnline(online){
        this.online = online;
    }
};

model.TronModel = class {
    constructor(){
        this.numberOfUsers = 0;
        this.users = {};
    }

    addUser(username, password) {
        if (this.users.hasOwnProperty(username)){
            throw Error();
        }
       this.users[username] = new model.User(username, password);
       this.numberOfUsers++;
       return new model.User(username,password)
    }

    deleteUser(username){
        delete this.users[username];
        this.numberOfUsers --;
    }

    getUser(username){
            return this.users[username];
    }

    getNumUsers(){
        return this.numberOfUsers;
    }

    getUsers(){
        return this.users;
    }

    authenticateUser(user, pass){
        try {
            if (this.users[user].getPassword() === pass) {
                return true;
            }
            else {
                return false;
            }
        }
        catch(Error){
            return false;
        }
    }
};


