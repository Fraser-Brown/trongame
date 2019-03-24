let chai = require('chai');
let expect = chai.expect;
let sinon = require('sinon');
let sinonChai = require('sinon-chai');
chai.use(sinonChai);

let model = require('../tron_model.js'); // for stubbing only
let api = require('../tron_api.js');


describe('API', function() {

    describe('creating users', function() {
        it('should return 201 on creating user', function () {
            let mockModel = sinon.stub(new model.TronModel());
            mockModel.addUser.onFirstCall().returns(new model.User('user','pass'));
            let req = {body: {username: 'goatzilla', password: 'x'}};
            let res = {end: function(){}};
            api.init(mockModel);
            api.createUser(req, res);
            expect(res.statusCode).to.equal(201);
            expect(mockModel.addUser).to.have.callCount(1);
        });

        it('should return representation of use on user creation', function() {
            let mockModel = sinon.stub(new model.TronModel());
            mockModel.addUser.onFirstCall().returns(new model.User('user','pass'));
            let req = {body: {username: 'goatzilla', password: 'x'}};
            let res = {end: function(data){this.data = data}};
            api.init(mockModel);
            api.createUser(req, res);
            let user = JSON.parse(res.data);
            expect(user).to.deep.equal({username: 'user', online: false});
        });

        it('should return 405 when user attempts to create use again', function() {

            let mockModel = sinon.stub(new model.TronModel());
            mockModel.addUser.onFirstCall().returns(new model.User('user','pass'));
            mockModel.addUser.onSecondCall().throws();
            let req = {body: {username: 'goatzilla', password: 'x'}};
            let res = {end: function(){}}, res2 = {end: function(){}};

            api.init(mockModel);
            api.createUser(req, res);
            api.createUser(req, res2);

            expect(res.statusCode).to.equal(201);
            expect(res2.statusCode).to.equal(405);
            expect(mockModel.addUser).to.have.callCount(2);
        });
    });

    // Note: the tests are not independent of the model.User class but that is ok
    // because it is so simple. If we wanted to change this, we would need to stub
    // the model.User class as well.
    describe('retrieving users', function() {

        it('should retrieve list of users', function() {
            let mockModel = sinon.stub(new model.TronModel());
            mockModel.getUsers.returns([new model.User('user','pass')]);
            api.init(mockModel);
            let req  = {};
            let res = {end: function(data){this.data = data}};
            api.getUsers(req, res);
            expect(res.statusCode).to.be.equal(200);
            expect(JSON.parse(res.data)).to.deep.equal([{username: 'user', online: false}]);
        });

        it('should get user by username', function() {
            let mockModel = sinon.stub(new model.TronModel());
            mockModel.getUser.onFirstCall().returns(new model.User('user','pass'));
            api.init(mockModel);
            let req  = {username: 'user'};
            let res = {end: function(data){this.data = data}};
            api.getUser(req, res);
            expect(res.statusCode).to.be.equal(200);
            expect(res.data).to.deep.equal({username: 'user', online: false});
        });

        it('should return 404 when user is not found', function() {
            let mockModel = sinon.stub(new model.TronModel());
            mockModel.getUser.onFirstCall().returns(undefined);
            api.init(mockModel);
            let req  = {param: {username: 'user'}};
            let res = {end: function(){}};
            api.getUser(req, res);
            expect(res.statusCode).to.be.equal(404);
        });
    });

    describe('WebSocket communication', function() {

        it('should change user online status when user connects', function(){
            // for you to complete
        });

        // more tests!

    });

});
