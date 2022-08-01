const mongoose=require('mongoose');

if(process.argv.length<3){
    console.log('Please provide the password as an argument: node mongo.js');
    process.exit(1);
}

const password=process.argv[2];
const url=`mongodb+srv://notes12:${password}@cluster0.ddpdxir.mongodb.net/?retryWrites=true&w=majority`;

const noteSchema=new mongoose.Schema({
    content:String,
    date:Date,
    important:Boolean
});

const Note=mongoose.model('Note',noteSchema);

mongoose.connect(url).then((response)=>{
    console.log('Connected');

    const newNote=new Note({
        content:'GET and POST are the most important methods of HTTP protocol',
        date: new Date(),
        important:true,
    })

    // return newNote.save();
    return Note.find({important:true});
}).then((result)=>{
    // console.log('Note Saved');
    result.forEach((entry)=>{
        console.log(entry);
    })
    return mongoose.connection.close();
}).catch((error)=>{
    console.log(error);
})