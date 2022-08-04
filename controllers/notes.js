const notesRouter = require('express').Router();
const Note = require('../models/note');

notesRouter.get('/', async (request, response) => {
    const notes = await Note.find({});
    response.json(notes);
})

notesRouter.get('/:id', async (request, response) => {
    const inputId = request.params.id;
    try{
        const resultNote=await Note.findById(inputId);
        response.json(resultNote);
    }catch(error){
        next(error);
    }

});

notesRouter.post('/', async (request, response) => {
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
    try {
        const addedNote = await note.save();
        response.status(201).json(addedNote);
    } catch (error) {
        next(error);
    }



});

notesRouter.put('/:noteId', (request, response) => {
    const noteId = request.params.noteId;
    Note.findById(noteId).then((result) => {
        const selectedNote = result.toJSON();
        const update = { important: !selectedNote.important };
        return Note.findByIdAndUpdate(selectedNote.id, update, { new: true });
    }).then((result) => {
        response.json(result);
    }).catch((error) => {
        next(error);
    })

});

notesRouter.delete('/:noteId', async (request, response) => {
    const noteId = request.params.noteId;

    try {
        await Note.findByIdAndDelete(noteId);
        response.status(204).end();
    } catch (error) {
        next(error);
    }
})
module.exports = notesRouter;