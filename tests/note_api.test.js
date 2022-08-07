const mongoose = require('mongoose');
const supertest = require('supertest');
const bcrypt=require('bcrypt');

const app = require('../app');
const Note = require('../models/note');
const User=require('../models/user');

const testHelper = require('./test_helper');

const api = supertest(app);



beforeEach(async () => {
    // const noteObjects=testHelper.forEach((note)=>new Note(note));
    // const promiseArray=noteObjects.map(note=>note.save());
    // await Promise.all(promiseArray);
    await Note.deleteMany({});
    await User.deleteMany({});

    const newUser = new User({
        username: 'root',
        name:'root',
        passwordHash: await bcrypt.hash('sekret', 10)
    });

    const savedUser=await newUser.save();

    const newNote=testHelper.initialNotes[0];

    newNote.user=savedUser._id;

    const newNoteModel=new Note(newNote);

    const savedNote=await newNoteModel.save();

    savedUser.notes=savedUser.notes.concat(savedNote._id);

    await savedUser.save();
    
})
describe('when there is initially some notes saved', () => {
    test('notes are returned as json', async () => {
        await api.get('/api/notes').expect(200).expect('Content-type', /application\/json/);
    })

    test('all notes are returned', async () => {
        const response = await api.get('/api/notes');

        expect(response.body).toHaveLength(1);
    });
    test('a specific note is within the returned notes', async () => {
        const response = await api.get('/api/notes');

        const contents = response.body.map((note) => note.content);
        expect(contents).toContain('HTML is easy');
    });
})


describe('addition of a new note', () => {
    test('a valid note can be added', async () => {
        const userToLogin={
            username:'root',
            password:'sekret'
        }

        const loginUser=await api.post('/api/login').send(userToLogin);
        const {jwtToken:token}=loginUser.body;

        const newNote = {
            content: 'async/await simplifies making async calls',
            important: true,
            date: new Date(),
        }
        const savedNote=await api.post('/api/notes').send(newNote).set('Authorization',`bearer ${token}`).expect(201).expect('Content-type', /application\/json/);
        const response = await testHelper.notesInDb();

        const {user}=savedNote.body;

        const contents = response.map(note => note.content);

        expect(contents).toHaveLength(2);
        expect(contents).toContain(newNote.content);
        expect(user.toString().length).toBeGreaterThan(0);
    })
    test('a note without content cannot be added', async () => {
        const newNote = {
            important: true,
            date: new Date(),
        }
        await api.post('/api/notes').send(newNote).expect(400);
        const response = await testHelper.notesInDb();

        const contents = response.map(note => note.content);

        expect(contents).toHaveLength(1);
    });
    test('a note without a valid token',async()=>{
        const newNote = {
            content: 'async/await simplifies making async calls',
            important: true,
            date: new Date(),
        }
        await api.post('/api/notes').send(newNote).expect(401);
    })
})

describe('Viewing a specific note', () => {
    test('a specific note can be viewed', async () => {
        const notes = await testHelper.notesInDb();
        const firstNote = notes[0];

        const resultNote = await api.get(`/api/notes/${firstNote.id}`).expect(200).expect('Content-type', /application\/json/);

        const processedNoteToView = JSON.parse(JSON.stringify(firstNote))

        expect(resultNote.body).toEqual(processedNoteToView);

    });
    test('a specific note is not present', async () => {
        const nonExistingNote = await testHelper.nonExistingId();
        
        await api.get(`/api/notes/${nonExistingNote}`).expect(404);
    });
    test('an invalid note id is passed', async () => {
        const invalidNoteId = 'sdfsdfaswfgsdgdgfad';

        await api.get(`/api/notes/${invalidNoteId}`).expect(400);
    })
})

describe('deletion of a note',() => {
    test('a specific note can be deleted', async () => {
        const notes = await testHelper.notesInDb();
        const firstNote = notes[0];

        await api.delete(`/api/notes/${firstNote.id}`).expect(204);

        const notesAtEnd = await testHelper.notesInDb();

        expect(notesAtEnd.length).toBe(0);

        const noteContents = notesAtEnd.map((note) => note.content);

        expect(noteContents).not.toContain(firstNote.content);

    })
})

afterAll(() => {
    mongoose.connection.close();
})