const mongoose = require('mongoose');

const traderSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String },
  address: { type: String },
  balance: { type: Number, default: 0 } // Total pending amount trader owes us
}, { timestamps: true });

module.exports = mongoose.model('Trader', traderSchema);
