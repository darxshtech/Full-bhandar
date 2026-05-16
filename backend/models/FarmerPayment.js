const mongoose = require('mongoose');

const farmerPaymentSchema = new mongoose.Schema({
  farmerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Farmer', required: true },
  billId: { type: mongoose.Schema.Types.ObjectId, ref: 'FarmerBill' }, // Can be null if generic payment
  date: { type: Date, default: Date.now },
  amount: { type: Number, required: true },
  receiptNumber: { type: String, required: true, unique: true },
  notes: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('FarmerPayment', farmerPaymentSchema);
