const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()

const mongoose = require('mongoose')


const url = "mongodb+srv://mathewalex:123@cluster0.buv2y.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"

const userModel = require('./models/User.js')



app.use(express.urlencoded({extended:false}))
app.use(cors())
app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});



app.post('/api/users', async function(req, res) {
  try {
    console.log('/api/users');

    const { username } = req.body;

    // Check if a user with the same username already exists
    const existingUser = await userModel.findOne({ username });

    if (existingUser) {
      // If user already exists, return the existing user's details
      return res.json(existingUser);
    }

    // If the username does not exist, create a new user instance
    const newUser = new userModel({ username });

    // Save the new user to the database
    const savedUser = await newUser.save();

    // Respond with the saved user
    res.json(savedUser);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create user' });
  }
});


app.post('/api/users/:_id/exercises', async function(req, res) {
  try {
    const { _id } = req.params;

    // Find the user by their ID
    const user = await userModel.findOne({ _id });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Assuming you want to add an exercise to this user
    const { description, duration, date } = req.body;

    // If the date is not provided, use the current date
    const exerciseDate = date ? new Date(date) : new Date();

    // Add exercise details to the user object (if you have a field for it)
    user.exercises = user.exercises || [];
    user.exercises.push({
      description,
      duration: parseInt(duration),
      date: exerciseDate
    });

    // Save the updated user with the new exercise
    await user.save();

    // Respond with the updated user data (or just the exercise details)
    res.json({
      _id: user._id,
      username: user.username,
      description,
      duration: parseInt(duration),
      date: exerciseDate.toDateString()
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to add exercise' });
  }
});




const listener = app.listen(process.env.PORT || 3000, function() {
  mongoose.connect(url).then(()=>console.log('connected'))
  console.log('Your app is listening on port ' + listener.address().port)
 
})
