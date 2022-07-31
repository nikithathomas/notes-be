// const http = require('http');
const express=require('express');
const cors=require('cors');

const app=express();

app.use(express.static('build'));
app.use(cors());
app.use(express.json());

let notes = [
    {
        id: 1,
        content: "HTML is easy",
        date: "2022-05-30T17:30:31.098Z",
        important: true
    },
    {
        id: 2,
        content: "Browser can execute only Javascript",
        date: "2022-05-30T18:39:34.091Z",
        important: false
    },
    {
        id: 3,
        content: "GET and POST are the most important methods of HTTP protocol",
        date: "2022-05-30T19:20:14.298Z",
        important: true
    }
]



app.get('/api/notes',(request,response)=>{
    response.json(notes);
})

app.get('/api/notes/:id',(request,response)=>{
    const inputId=Number(request.params.id);
    const selectedNote=notes.find((note)=>note.id===inputId);
    response.json(selectedNote);
});
const generateId=()=>{
    const maxId=notes.length>0?Math.max(...notes.map((note)=>note.id)):0;
    return maxId+1;
}
app.post('/api/notes',(request,response)=>{
  const body=request.body;
  console.log(body);
  if(!body.content){
    return response.status(400).json({
        error:'content missing'
    });
  }
  const note={
    content:body.content,
    important:body.important||false,
    date:new Date(),
    id:generateId()
  }
  notes=notes.concat(note);
  response.json(note);
});

app.put('/api/notes/:noteId',(request,response)=>{
    const noteId=parseInt(request.params.noteId,10);
    
    if(noteId && typeof noteId==='number' && notes.length){
        let selectedNote;
        for(let note of notes){
            if(note.id===noteId){
                note.important=!note.important;
                selectedNote=note;
                break;
            }
        }
        if(selectedNote){
            return response.send(selectedNote);
        }
        return response.status(400).send({error:`The note ${noteId} is not present`});
    }
    return response.status(400).send({error:`The input is incorrect`});
});

app.get('/',(request,response)=>{
    response.redirect('/index.html');
});

const PORT = process.env.PORT||3001;
app.listen(PORT,()=>{
    console.log(`Server started on ${PORT}`);
});
