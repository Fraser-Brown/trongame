/**
 * Quite incomplete set of unit tests for the
 * model Tron Light Cycle game model.
 */
let chai = require("chai");
let expect = chai.expect;
let sinon = require('sinon');
let sinonChai = require("sinon-chai");
chai.use(sinonChai);
let model = require('../tron_model.js');

describe("Tron Light Cycle Model", function() {

    it('should export classes', function() {
        expect(typeof model.Cycle).to.equal("function");
        expect(typeof model.Grid).to.equal("function");
        expect(typeof model.User).to.equal("function");
        expect(typeof model.TronModel).to.equal("function");
    });

    describe('Game logic', function() {

        it('should produce correct initial game state', function() {
            let game = model.Game.newGame();
            expect(game.getYellowCycle().getX()).to.equal(50);
            expect(game.getBlueCycle().getX()).to.equal(50);
            expect(game.getYellowCycle().getY()).to.equal(1);
            expect(game.getBlueCycle().getY()).to.equal(99);
            expect(game.get(50,1)).to.equal('y');
            expect(game.get(50,99)).to.equal('b');
        });

        it('should plot path of both cycles forward each step', function() {
            let game = model.Game.newGame();
            game.step();
            expect(game.get(50,2)).to.equal('y');
            expect(game.get(50,98)).to.equal('b');
            game.step();
            expect(game.get(50,3)).to.equal('y');
            expect(game.get(50,97)).to.equal('b');
        });

        it('should not declare game ended when it has not', function() {
            let game = model.Game.newGame();
            expect(game.hasEnded()).to.be.equal(false);
        });

        it('should detect collision with wall', function() {
            let yCycle = new model.Cycle('y', 50, 1, 'up');
            let bCycle = new model.Cycle('b', 50, 99, 'up');
            let grid = new model.Grid();
            let game = new model.Game(grid, yCycle, bCycle);
            game.step();
            expect(game.hasEnded()).to.be.equal(true);
        });

        it('should detect collision with trace', function() {
            let yCycle = new model.Cycle('y', 50, 1, 'up');
            let bCycle = new model.Cycle('b', 50, 99, 'down');
            let grid = new model.Grid();
            grid.set(50,2, 'y');
            let game = new model.Game(grid, yCycle, bCycle);
            game.step();
            expect(game.hasEnded()).to.be.equal(true);
            expect(game.getWinner()).to.be.equal(bCycle);
        });

        it('should turn cycle', function() {
            let game = model.Game.newGame();
            game.turnCycle('y', 'left');
            game.step();
            expect(game.getYellowCycle().getX()).to.equal(49);
        });

        it('should detect collision with with other bike', function() {
            let yCycle = new model.Cycle('y', 50, 1, 'up');
            let bCycle = new model.Cycle('b', 50, 3, 'down');
            let grid = new model.Grid();
            let game = new model.Game(grid, yCycle, bCycle);
            game.step();
            expect(game.hasEnded()).to.be.equal(true);
            expect(game.getWinner()).to.be.equal("Draw");
        });

        it('should detect both colliding into traces at the same time', function() {
            let yCycle = new model.Cycle('y', 50, 1, 'up');
            let bCycle = new model.Cycle('b', 50, 2, 'down');
            let grid = new model.Grid();
            let game = new model.Game(grid, yCycle, bCycle);
            game.step();
            expect(game.hasEnded()).to.be.equal(true);
            expect(game.getWinner()).to.be.equal('Draw');
        });

        it('should detect both colliding into walls at the same time', function() {
            let yCycle = new model.Cycle('y', 50, 1, 'down');
            let bCycle = new model.Cycle('b', 50, 99, 'up');
            let grid = new model.Grid();
            let game = new model.Game(grid, yCycle, bCycle);
            game.step();
            expect(game.hasEnded()).to.be.equal(true);
            expect(game.getWinner()).to.be.equal('Draw');
        });

    });

    describe('TronModel', function() {

        it('should add user', function() {
            let tronModel = new model.TronModel();
            expect(
                tronModel.addUser('goatzilla','secret')
            ).to.be.instanceOf(model.User);
            expect(tronModel.getNumUsers()).to.equal(1);
        });

        it('should throw if attempting to add existing user', function() {
            let tronModel = new model.TronModel();
            tronModel.addUser('goatzilla','secret');
            expect(function() {
                tronModel.addUser('goatzilla','secret');
            }).to.throw(Error);
        });

        it('should delete user', function() {
            let tronModel = new model.TronModel();
            tronModel.addUser('goatzilla','secret');
            tronModel.deleteUser('goatzilla');
            expect(tronModel.getNumUsers()).to.equal(0);
        });

        it('should have any users initially', function(){
            let tronModel = new model.TronModel();
            expect(tronModel.getNumUsers()).to.equal(0);
        })
    });

    describe('User', function() {
        // the functions there are very simple and better
        // just visually inspected.
    });

});