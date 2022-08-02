require('dotenv').config()
const express = require('express');
const cors = require('cors');
const Note = require('./models/note.js');

const app = express();

app.use(express.static('build'));
app.use(cors());
app.use(express.json());



app.get('/api/notes', (request, response) => {
    Note.find({}).then((result) => {
        response.json(result);
    });
})

app.get('/api/notes/:id', (request, response) => {
    const inputId = request.params.id;
    Note.findById(inputId).then((selectedNote) => {
        response.json(selectedNote);
    });
});

app.post('/api/notes', (request, response) => {
    const body = request.body;

    if (!body.content) {
        return response.status(400).json({
            error: 'content missing'
        });
    }
    const note = new Note({
        content: body.content,
        important: body.important || false,
        date: new Date(),
    });
    note.save().then((result) => {
        response.json(result);
    })

});

app.put('/api/notes/:noteId', (request, response) => {
    const noteId = request.params.noteId;

    if (noteId && noteId.length) {
        Note.findById(noteId).then((result) => {
            const selectedNote = result.toJSON();
            const update = { important: !selectedNote.important };
            return Note.findByIdAndUpdate(selectedNote.id, update, { new: true });
        }).then((result)=>{
            response.json(result);
        }).catch((error) => {
            return response.status(400).send({ error: `The note has not been updated` });
        })

    }
});

app.get('/', (request, response) => {
    response.redirect('/index.html');
});

const PORT = process.env.PORT;
app.listen(PORT, () => {
    console.log(`Server started on ${PORT}`);
});
