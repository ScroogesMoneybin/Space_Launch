//express functionality
//express functionally acts like middleware for node http functionality
const path = require('path');
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const api = require('./routes/api.routes')

const app = express();

//cors allows connection between client and server.  only want to accept connection from front end
app.use(cors({
    origin: 'http://localhost:3000'
}));

//logger middleware morgan 
app.use(morgan('combined'))

app.use(express.json());

//We built the front-end and put it in the server public folder, so now we'll serve the static public files here. It will now load the front-end on the back-end route localhost:8000
app.use(express.static(path.join(__dirname,'..','public')));

app.use('/v1', api);

//We need to adjust the route to the index.html file to load on the homepage root '/' which is localhost:8000
app.get('/*',(req,res)=>{
    res.sendFile(path.join(__dirname, '..','public','index.html'))
})

module.exports = app;