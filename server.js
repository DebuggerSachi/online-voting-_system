const express = require('express'); // ✅ Creating server
console.log("server.js has started running"); // ✅ Checking if file runs
const mongoose = require('mongoose'); // ✅ Connecting MongoDB - helps to store/retrieve data
const bodyParser = require('body-parser'); // ✅ Reads form data sent from HTML
const cors = require('cors'); // ✅ Allows frontend and backend communication without error
const Voter = require('./models/Voter'); // ✅ Importing schema which defines shape of each voter

const app = express();
const PORT = 3000; // ✅ Setting up express server to run on port 3000

// ✅ Middleware (they run before routes)
app.use(cors()); // ✅ Allows frontend and backend to talk
app.use(bodyParser.urlencoded({ extended: true })); // ✅ Handles HTML form data
app.use(bodyParser.json()); // ✅ Reads JSON data from frontend
app.use(express.static('public')); // ✅ Serves static files like HTML, CSS, JS

// ✅ Connecting to MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/votingDB', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('✅ Connected to MongoDB')) // ✅ Connection successful
.catch((err) => console.error('❌ MongoDB connection error:', err)); // ❌ Error in connection

// ✅ Route to register a voter
app.post('/register', async (req, res) => {
  try {
    const { voterId, name, dob, email, phone, password } = req.body;

    // ✅ Check if already registered
    const exists = await Voter.findOne({ voterId });
    if (exists) {
      return res.status(400).send("❌ Voter already registered");
    }

    // ✅ If not registered, save new voter
    const newVoter = new Voter({ voterId, name, dob, email, phone, password });
    await newVoter.save();

    res.send("✅ Voter registered successfully");
  } catch (err) {
    console.error(err);
    res.status(500).send("❌ Server error");
  }
});

// ✅ Route to login voter
app.post('/login', async (req, res) => {
  const { voterId, password } = req.body;

  // ✅ Find the user in DB
  const user = await Voter.findOne({ voterId });

  if (!user) {
    return res.json({ success: false, message: "❌ Voter not found" });
  }

  // ✅ Check if password is correct
  if (user.password !== password) {
    return res.json({ success: false, message: "❌ Invalid password" });
  }

  // ✅ Check if already voted
  if (user.voted) {
    return res.json({ success: false, message: "🗳️ You have already voted!" });
  }

  res.json({ success: true }); // ✅ Login successful
});

// ✅ Route to handle voting
app.post('/vote', async (req, res) => {
  try {
    const { voterId, party } = req.body;

    // ✅ Find the voter
    const voter = await Voter.findOne({ voterId });

    if (!voter) {
      return res.status(400).json({ success: false, message: "❌ Voter not found." });
    }

    // ✅ Check if already voted
    if (voter.voted) {
      return res.status(400).json({ success: false, message: "🗳️ You have already voted!" });
    }

    // ✅ Mark as voted and store the party name
    voter.voted = true;
    voter.vote = party;
    await voter.save();

    res.json({ success: true, message: "✅ Vote recorded successfully!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "❌ Server error" });
  }
});
// ✅ Route to get live voting results
app.get('/results', async (req, res) => {
  try {
    const votes = await Voter.aggregate([
      { $match: { voted: true } },
      { $group: { _id: "$vote", count: { $sum: 1 } } }
    ]);

    const results = {};
    votes.forEach(v => {
      results[v._id] = v.count;
    });

    res.json(results); // send result as JSON
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "❌ Could not fetch results" });
  }
});


// ✅ Start the server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});


