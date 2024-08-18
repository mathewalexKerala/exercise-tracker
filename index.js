const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()

const mongoose = require('mongoose')


const url = "mongodb+srv://mathewalex:123@cluster0.buv2y.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"

const Schema = mongoose.Schema;

const UserSchema = new Schema({
  username: String
});

// Correcting the export syntax
const userModel = mongoose.model('User', UserSchema);


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
app.get('/api/users', async (req, res) => {
  try {
    const users = await userModel.find({}, 'username _id');
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});
app.get('/api/users/:_id/logs', async (req, res) => {
  try {
    const { _id } = req.params;
    const user = await userModel.findById(_id);

    if (!user) return res.status(404).json({ error: 'User not found' });

    let query = exerciseModel.find({ userId: _id });

    // Apply `from`, `to`, and `limit` query parameters if provided
    if (req.query.from) query = query.where('date').gte(new Date(req.query.from));
    if (req.query.to) query = query.where('date').lte(new Date(req.query.to));
    if (req.query.limit) query = query.limit(parseInt(req.query.limit));

    const log = await query.select('description duration date').exec();

    res.json({
      username: user.username,
      count: log.length,
      _id: user._id,
      log: log.map(ex => ({
        description: ex.description,
        duration: ex.duration,
        date: ex.date.toDateString()
      }))
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch logs' });
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
