const mongoose = require('mongoose');

const farmerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String },
  address: { type: String },
  balance: { type: Number, default: 0 } // Total pending amount we owe to the farmer
}, { timestamps: true });

module.exports = mongoose.model('Farmer', farmerSchema);
