const mongoose = require('mongoose');

const farmerBillSchema = new mongoose.Schema({
  farmerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Farmer', required: true },
  billNumber: { type: String, required: true, unique: true },
  date: { type: Date, default: Date.now },
  productName: { type: String, required: true },
  weight: { type: Number, required: true },
  rate: { type: Number, required: true },
  totalAmount: { type: Number, required: true }, // Weight * Rate
  paidAmount: { type: Number, default: 0 },
  status: { type: String, enum: ['PENDING', 'PARTIAL', 'PAID'], default: 'PENDING' }
}, { timestamps: true });

module.exports = mongoose.model('FarmerBill', farmerBillSchema);
