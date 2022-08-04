const config=require('./utils/config');
const express = require('express');
require('express-async-errors');
const cors = require('cors');
const logger=require('./utils/logger');
const middleware=require('./utils/middleware');
const notesRouter=require('./controllers/notes');
const mongoose=require('mongoose');

const app = express();

logger.info('connecting to', config.MONGODB_URI)

mongoose.connect(config.MONGODB_URI).then(()=>{
    logger.info('Db connected');
}).catch((error)=>{
    logger.error('Error in db connection');
});

app.use(cors());
app.use(express.static('build'));
app.use(express.json());
app.use(middleware.requestLogger);

app.use('/api/notes',notesRouter);

app.use(middleware.unknownEndpoint);
app.use(middleware.errorHandler);

module.exports=app;