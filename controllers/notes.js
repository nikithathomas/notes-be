const jwt=require('jsonwebtoken');
const config=require('../utils/config');
const notesRouter = require('express').Router();
const Note = require('../models/note');
const User = require('../models/user');

const getToken=(request)=>{
    const authorization=request.get('authorization');
    if(authorization && authorization.toLowerCase().startsWith('bearer')){
        return authorization.substring(7);
    }
    return null;
}
notesRouter.get('/', async (request, response) => {
    const notes = await Note.find({}).populate('user',{username:1,name:1});
    response.json(notes);
})

notesRouter.get('/:id', async (request, response) => {
    const inputId = request.params.id;
    const resultNote = await Note.findById(inputId);
    if (resultNote) {
        response.json(resultNote);
    } else {
        response.status(404).end();
    }


});

notesRouter.post('/', async (request, response) => {
    const body = request.body;

    if (!body.content) {
        return response.status(400).json({
            error: 'content missing'
        });
    }
    const isTokenPresent=getToken(request);
    const decodedToken=jwt.verify(isTokenPresent,config.SECRET);
    if(!decodedToken || !decodedToken.id){
        
        return response.status(401).send({error:'token missing or invalid'})
    }
    const noteUser=await User.findById(decodedToken.id);

    const note = new Note({
        content: body.content,
        important: body.important || false,
        date: new Date(),
        user: noteUser._id
    });

    const addedNote = await note.save();

    noteUser.notes = noteUser.notes.concat(addedNote._id);
    await noteUser.save();

    response.status(201).json(addedNote);



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
    await Note.findByIdAndDelete(noteId);
    response.status(204).end();
})
module.exports = notesRouter;