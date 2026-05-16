const express = require('express');
const router = express.Router();
const FarmerBill = require('../models/FarmerBill');
const FarmerPayment = require('../models/FarmerPayment');
const TraderBill = require('../models/TraderBill');
const TraderPayment = require('../models/TraderPayment');
const Farmer = require('../models/Farmer');
const Trader = require('../models/Trader');

// Get dashboard summary
router.get('/summary', async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Total Material In (Today)
    const materialInToday = await FarmerBill.aggregate([
      { $match: { date: { $gte: today } } },
      { $group: { _id: null, totalWeight: { $sum: "$weight" }, totalAmount: { $sum: "$totalAmount" } } }
    ]);

    // Total Sales (Today)
    const salesToday = await TraderBill.aggregate([
      { $match: { date: { $gte: today } } },
      { $group: { _id: null, totalWeight: { $sum: "$weight" }, totalAmount: { $sum: "$totalAmount" } } }
    ]);

    // Total Cash In (From Traders)
    const cashIn = await TraderPayment.aggregate([
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);

    // Total Cash Out (To Farmers)
    const cashOut = await FarmerPayment.aggregate([
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);

    // Total Pending Payments (To Farmers)
    const pendingToFarmers = await Farmer.aggregate([
      { $group: { _id: null, total: { $sum: "$balance" } } }
    ]);

    // Total Pending Receivables (From Traders)
    const pendingFromTraders = await Trader.aggregate([
      { $group: { _id: null, total: { $sum: "$balance" } } }
    ]);

    res.json({
      materialInToday: materialInToday[0] || { totalWeight: 0, totalAmount: 0 },
      salesToday: salesToday[0] || { totalWeight: 0, totalAmount: 0 },
      totalCashIn: cashIn[0]?.total || 0,
      totalCashOut: cashOut[0]?.total || 0,
      pendingToFarmers: pendingToFarmers[0]?.total || 0,
      pendingFromTraders: pendingFromTraders[0]?.total || 0
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get reports (with date filter)
router.get('/reports', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    let matchStage = {};

    if (startDate && endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      matchStage.date = {
        $gte: new Date(startDate),
        $lte: end
      };
    }

    const materialIn = await FarmerBill.aggregate([
      { $match: matchStage },
      { $group: { _id: null, totalWeight: { $sum: "$weight" }, totalAmount: { $sum: "$totalAmount" } } }
    ]);

    const sales = await TraderBill.aggregate([
      { $match: matchStage },
      { $group: { _id: null, totalWeight: { $sum: "$weight" }, totalAmount: { $sum: "$totalAmount" } } }
    ]);

    const cashIn = await TraderPayment.aggregate([
      { $match: matchStage },
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);

    const cashOut = await FarmerPayment.aggregate([
      { $match: matchStage },
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);

    res.json({
      materialIn: materialIn[0] || { totalWeight: 0, totalAmount: 0 },
      sales: sales[0] || { totalWeight: 0, totalAmount: 0 },
      cashIn: cashIn[0]?.total || 0,
      cashOut: cashOut[0]?.total || 0
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
