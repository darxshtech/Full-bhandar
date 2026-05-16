const mongoose = require('mongoose');

const traderPaymentSchema = new mongoose.Schema({
  traderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Trader', required: true },
  billId: { type: mongoose.Schema.Types.ObjectId, ref: 'TraderBill' }, // Can be null if generic payment
  date: { type: Date, default: Date.now },
  amount: { type: Number, required: true },
  receiptNumber: { type: String, required: true, unique: true },
  notes: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('TraderPayment', traderPaymentSchema);
