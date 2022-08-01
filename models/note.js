const mongoose=require('mongoose');

const url=process.env.MONGODB_URI;

mongoose.connect(url).then(()=>{
    console.log('Db connected');
}).catch((error)=>{
    console.log('Error in db connection');
});

const noteSchema=new mongoose.Schema({
    content:String,
    date:Date,
    important:Boolean
});

noteSchema.set('toJson',{
    transform:(document, returnedObject)=>{
        returnedObject.id=returnedObject._id.toString();
        delete returnedObject._id
        delete returnedObject.__v
    }
})

module.exports=mongoose.model('Note',noteSchema);