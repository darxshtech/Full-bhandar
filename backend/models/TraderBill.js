const mongoose = require('mongoose');

const traderBillSchema = new mongoose.Schema({
  traderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Trader', required: true },
  billNumber: { type: String, required: true, unique: true },
  date: { type: Date, default: Date.now },
  productName: { type: String, required: true },
  unit: { type: String, default: 'Carret' },
  weight: { type: Number, required: true },
  rate: { type: Number, required: true },
  totalAmount: { type: Number, required: true }, // Weight * Rate
  paidAmount: { type: Number, default: 0 },
  status: { type: String, enum: ['PENDING', 'PARTIAL', 'PAID'], default: 'PENDING' },
  notes: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('TraderBill', traderBillSchema);
