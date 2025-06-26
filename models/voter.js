const mongoose = require('mongoose');

// Define the schema for each voter
const voterSchema = new mongoose.Schema({
  voterId: { type: String, unique: true }, // unique voter ID
  name: String,                            // voter's name
  dob: String,                             // date of birth
  email: String,                           // email ID
  phone: String,                           // mobile number
  password: String,                        // password
  voted: { type: Boolean, default: false },// whether voted or not
  vote: String                             // party they voted for
});

// Export the model so it can be used in server.js
module.exports = mongoose.model('Voter', voterSchema);


