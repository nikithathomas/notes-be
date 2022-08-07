const supertest = require('supertest');
const bcrypt = require('bcrypt');

const app = require('../app');
const User = require('../models/User');

const api = supertest(app);

beforeEach(async () => {
    await User.deleteMany({});

    const newUser = new User({
        username: 'root',
        name:'root',
        passwordHash: await bcrypt.hash('sekret', 10)
    });

    await newUser.save();
});

describe('Login user', () => {
    test('with valid credentials',async () => {
        const newUser={
            username:'root',
            password:'sekret'
        }

        const loginResponse=await api.post('/api/login').send(newUser).expect(200).expect('Content-type',/application\/json/);

        expect(loginResponse.body.jwtToken).toBeDefined();
        expect(loginResponse.body.username).toBeDefined();
        expect(loginResponse.body.name).toBeDefined();
    });
    test('with invalid username', () => {

    });
    test('with invalid password', () => {

    })
})