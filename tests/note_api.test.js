const mongoose = require('mongoose');
const supertest = require('supertest');
const app = require('../app');
const Note = require('../models/note');
const testHelper = require('./test_helper');

const api = supertest(app);



beforeEach(async () => {
    await Note.deleteMany({});
    const noteObjects=testHelper.forEach((note)=>new Note(note));
    const promiseArray=noteObjects.map(note=>note.save());
    await Promise.all(promiseArray);
})
test('notes are returned as json', async () => {
    await api.get('/api/notes').expect(200).expect('Content-type', /application\/json/);
})

test('there are two notes', async () => {
    const response = await api.get('/api/notes');

    expect(response.body).toHaveLength(testHelper.initialNotes.length);
});
test('the first note is about HTTP methods', async () => {
    const response = await api.get('/api/notes');

    const contents = response.body.map((note) => note.content);
    expect(contents).toContain('HTML is easy');
});
test('a valid note can be added', async () => {
    const newNote = {
        content: 'async/await simplifies making async calls',
        important: true,
        date: new Date(),
    }
    await api.post('/api/notes').send(newNote).expect(201).expect('Content-type', /application\/json/);
    const response = await testHelper.notesInDb();

    const contents = response.map(note => note.content);

    expect(contents).toHaveLength(testHelper.initialNotes.length + 1);
    expect(contents).toContain(newNote.content);
})

test('a note without content cannot be added', async () => {
    const newNote = {
        important: true,
        date: new Date(),
    }
    await api.post('/api/notes').send(newNote).expect(400);
    const response = await testHelper.notesInDb();

    const contents = response.map(note => note.content);

    expect(contents).toHaveLength(testHelper.initialNotes.length);
});

test('a specific note can be viewed', async () => {
    const notes=await testHelper.notesInDb();
    const firstNote=notes[0];

    const resultNote=await api.get(`/api/notes/${firstNote.id}`).expect(200).expect('Content-type',/application\/json/);

    const processedNoteToView = JSON.parse(JSON.stringify(firstNote))

    expect(resultNote.body).toEqual(processedNoteToView);

});

test('a specific note can be deleted', async() => {
    const notes=await testHelper.notesInDb();
    const firstNote=notes[0];

    await api.delete(`/api/notes/${firstNote.id}`).expect(204);

    const notesAtEnd=await testHelper.notesInDb();

    expect(notesAtEnd.length).toBe(testHelper.initialNotes.length-1);

    const noteContents=notesAtEnd.map((note)=>note.content);

    expect(noteContents).not.toContain(firstNote.content);

})
afterAll(() => {
    mongoose.connection.close();
})