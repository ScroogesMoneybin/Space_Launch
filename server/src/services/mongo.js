require("dotenv").config();
const mongoose = require('mongoose');

mongoose.connection.once('open', () => {
    console.log('MongoDB connection ready.')
})

mongoose.connection.on('error', (err) => {
    console.error('MongoDB error:', err)
});


async function mongoConnect () {
    await mongoose.connect(`${process.env.MONGODB_URL}`);
}

async function disconnectMongo () {
    await mongoose.disconnect();
}


module.exports = {mongoConnect, disconnectMongo}