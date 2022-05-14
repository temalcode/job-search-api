
const mongoose = require('mongoose');

const jobSchema = mongoose.Schema({

    title: {
        type: String,
        required: true,
        minLength: 3,
        maxLength: 100
    },
    description: {
        type: String,
        required: true,
        minLength: 3
    },
    position: {
        type: String,
        required: true,
        minLength: 3,
        maxLength: 100
    },
    company: {
        type: String,
        required: true,
        minLength: 3,
        maxLength: 100
    },
    city: {
        type: String,
        required: true,
        minLength: 3,
        maxLength: 100
    },
    contactnumber: {
        type: Number,
        required: true,
        maxLength: 100
    },
    dateAdded: {
        type: Date,
        default: () => Date.now()
    }
});

module.exports = mongoose.model('jobs', jobSchema);