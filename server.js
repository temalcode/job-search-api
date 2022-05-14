//express
const express = require('express');
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
//cookie parser
const cookieParser = require('cookie-parser');
app.use(cookieParser());
//cors
const cors = require('cors');
app.use(cors());
//dotenv
const dotenv = require('dotenv');
dotenv.config();
//mongoose
const mongoose = require('mongoose');
mongoose.connect(process.env.DB_URL, () => console.log('connected to database'));
const jobModel = require('./jobModel');
//bcrypt
const bcrypt = require('bcrypt');
//limit requests
const ratelimiter = require('express-rate-limit');
app.use(ratelimiter({
    windowMs: 15 * 60 * 1000,
    max: 100
}));


app.get('/', function(req, res){
    try{
        res.send('NodeJS Job API');
    } catch(err){
        res.status(500).send(err.message);
    }
})

app.get('/vacancies', async function (req, res) {
    try {
        let allJobs = await jobModel.find();
        res.status(200).json(allJobs);
    } catch (err) {
        res.status(500).send(err.message);
    }
});

//get a job vacancy by id
app.get('/vacancy/:id', async function (req, res) {
    try {
        let job = await jobModel.findById(req.params.id);
        res.status(200).json(job);
    } catch (err) {
        res.status(400).send(err.message);
    }
});

//create a new job vacancy
app.post('/vacancy/create', authenticateAdmin, async function (req, res) {
    try {
        let createdJob = new jobModel({
            title: req.body.title,
            description: req.body.description,
            position: req.body.position,
            company: req.body.company,
            city: req.body.city,
            contactnumber: req.body.contactnumber
        });
        let savedJob = await createdJob.save();
        res.status(200).send(savedJob);
    } catch (err) {
        res.status(500).send(err.message);
    }
});

//delete vacancy
app.delete('/vacancy/delete/:id', authenticateAdmin, async function (req, res) {
    try {
        let deleted = await jobModel.findByIdAndDelete(req.params.id);
        res.status(200).send(deleted);
    } catch (err) {
        res.status(500).send(err.message);
    }
})

//update vacancy
app.put('/vacancy/update/:id', authenticateAdmin, async function (req, res) {
    try {
        let updatedVacancy = await jobModel.findByIdAndUpdate(req.params.id, {
            title: req.body.title,
            description: req.body.description,
            position: req.body.position,
            company: req.body.company,
            city: req.body.city,
            contactnumber: req.body.contactnumber
        },
        {
            new: true,                       
            runValidators: true
    	});
        res.status(200).send(updatedVacancy);
    } catch (err) {
        res.status(500).send(err.message)
    }
});

//admin login
app.post('/login', async function (req, res) {
    try {
        bcrypt.hash(process.env.ADMIN_PASSWORD, 10, function (err, hashedPassword) {
            bcrypt.compare(req.body.password, hashedPassword, function (err, result) {
                if (err) {
                    res.send(err.message)
                }
                else {
                    if (result) {
                        res.cookie('password', hashedPassword, {httpOnly: true});
                        res.status(200).send('logged successfully');
                    } else {
                        res.status(400).send('password is wrong');
                    }
                }
            });
        })
    } catch (err) {
        res.status(500).send(err.message);
    }
});

//authenticate admin
function authenticateAdmin(req, res, next) {
    try {
        bcrypt.compare(process.env.ADMIN_PASSWORD, req.cookies.password, function (err, result) {
            if (err) {
                res.send(err.message)
            }
            else {
                if (result) {
                    next();
                } else {
                    res.status(400).send('password is wrong');
                }
            }
        });
    } catch (err) {
        res.status(400).send('please log in first');
    }
}

//404
app.get("*", function (req, res) {
    res.status(404).send('resource not found')
});

//listen
app.listen(process.env.PORT || 5000, () => console.log('server is running'));
