const mongoose = require('mongoose');

const launchesSchema = new mongoose.Schema({
    flightNumber: {
        type: Number,
        required: true
    },
    launchDate: {
        type: Date,
        required: true
    },
    mission: {
        type: String,
        required: true
    },
    rocket: {
        type: String,
        required: true
    },
    target: {
        type: String,
        // required: true
    },
    customers: [ String ],
    upcoming: {
        type: Boolean,
        required: true,
        default: true
    },
    success: {
        type: Boolean,
        required: true,
        default: true
    },

});

//Connects the launchesSchema with the "launches" Collection in Mongodb.
module.exports = mongoose.model('Launch', launchesSchema);  //The first argument must be a singular capitalized form of the collection. Mongo lowercases it and pluralizes it automatically.
