const bcrypt=require('bcrypt');
const testHelper=require('./test_helper');
const User=require('../models/user');
const app=require('../app');

const supertest=require('supertest');

const api=supertest(app);
describe('when there is initially one user in db',()=>{
    beforeEach(async()=>{
        await User.deleteMany({});
        
        const passwordHash=await bcrypt.hash('sekret',10);
        const newUser=new User({
            username:'root',
            passwordHash
        });
        await newUser.save();
    })
    test('creation succeeds with a fresh username',async()=>{
        const usersAtStart=await testHelper.usersInDb();

        const newUser={
            username:'sdfsd',
            name:'sdfsdf',
            password:'sdfsd'
        };

        const savedUser=await api.post('/api/users').send(newUser).expect(201).expect('Content-type',/application\/json/);

        const usersAfterInsert=await testHelper.usersInDb();

        expect(usersAfterInsert.length).toBe(usersAtStart.length+1);

        const usernames=usersAfterInsert.map((user)=>user.username);

        expect(usernames).toContain(savedUser.body.username);
    })
    test('creation fails with a duplicate username',async()=>{
        const usersAtStart=await testHelper.usersInDb();

        const newUser={
            username:'root',
            name:'sdfsdf',
            password:'sdfsd'
        };

        await api.post('/api/users').send(newUser).expect(400);

        const usersAfterInsert=await testHelper.usersInDb();

        expect(usersAfterInsert.length).toBe(usersAtStart.length);
    })
})