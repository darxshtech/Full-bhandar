const express = require('express');
const router = express.Router();
const Trader = require('../models/Trader');
const TraderBill = require('../models/TraderBill');
const TraderPayment = require('../models/TraderPayment');

// Get all traders
router.get('/', async (req, res) => {
  try {
    const traders = await Trader.find().sort({ createdAt: -1 });
    res.json(traders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Add new trader
router.post('/', async (req, res) => {
  const trader = new Trader({
    name: req.body.name,
    phone: req.body.phone,
    address: req.body.address
  });
  try {
    const newTrader = await trader.save();
    res.status(201).json(newTrader);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update trader
router.put('/:id', async (req, res) => {
  try {
    const trader = await Trader.findById(req.params.id);
    if (!trader) return res.status(404).json({ message: 'Trader not found' });

    if (req.body.name) trader.name = req.body.name;
    if (req.body.phone) trader.phone = req.body.phone;
    if (req.body.address) trader.address = req.body.address;

    const updatedTrader = await trader.save();
    res.json(updatedTrader);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete trader
router.delete('/:id', async (req, res) => {
  try {
    const trader = await Trader.findById(req.params.id);
    if (!trader) return res.status(404).json({ message: 'Trader not found' });

    // Delete related bills and payments
    await TraderBill.deleteMany({ traderId: req.params.id });
    await TraderPayment.deleteMany({ traderId: req.params.id });
    
    await Trader.findByIdAndDelete(req.params.id);
    res.json({ message: 'Trader and all related records deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get trader details including bills and payments
router.get('/:id', async (req, res) => {
  try {
    const trader = await Trader.findById(req.params.id);
    if (!trader) return res.status(404).json({ message: 'Trader not found' });
    
    const bills = await TraderBill.find({ traderId: req.params.id }).sort({ date: -1 });
    const payments = await TraderPayment.find({ traderId: req.params.id }).sort({ date: -1 });
    
    res.json({ trader, bills, payments });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Add Material Out (Sales Invoice)
router.post('/:id/bills', async (req, res) => {
  try {
    const trader = await Trader.findById(req.params.id);
    if (!trader) return res.status(404).json({ message: 'Trader not found' });

    const totalAmount = req.body.weight * req.body.rate;
    const count = await TraderBill.countDocuments();
    const billNumber = `TB-${Date.now()}-${count + 1}`;

    const bill = new TraderBill({
      traderId: req.params.id,
      billNumber,
      date: req.body.date || Date.now(),
      productName: req.body.productName,
      unit: req.body.unit,
      weight: req.body.weight,
      rate: req.body.rate,
      totalAmount,
      notes: req.body.notes
    });

    const savedBill = await bill.save();
    
    // Update trader balance (increase pending amount they owe us)
    trader.balance += totalAmount;
    await trader.save();

    res.status(201).json(savedBill);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update Bill
router.put('/:id/bills/:billId', async (req, res) => {
  try {
    const trader = await Trader.findById(req.params.id);
    if (!trader) return res.status(404).json({ message: 'Trader not found' });

    const bill = await TraderBill.findById(req.params.billId);
    if (!bill) return res.status(404).json({ message: 'Bill not found' });

    const oldTotal = bill.totalAmount;
    
    if (req.body.productName) bill.productName = req.body.productName;
    if (req.body.unit) bill.unit = req.body.unit;
    if (req.body.weight !== undefined) bill.weight = req.body.weight;
    if (req.body.rate !== undefined) bill.rate = req.body.rate;
    if (req.body.date) bill.date = req.body.date;
    if (req.body.notes !== undefined) bill.notes = req.body.notes;

    bill.totalAmount = bill.weight * bill.rate;
    const newTotal = bill.totalAmount;

    const savedBill = await bill.save();

    // Update trader balance
    trader.balance += (newTotal - oldTotal);
    await trader.save();

    res.json(savedBill);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete Bill
router.delete('/:id/bills/:billId', async (req, res) => {
  try {
    const trader = await Trader.findById(req.params.id);
    if (!trader) return res.status(404).json({ message: 'Trader not found' });

    const bill = await TraderBill.findById(req.params.billId);
    if (!bill) return res.status(404).json({ message: 'Bill not found' });

    trader.balance -= bill.totalAmount;
    
    await TraderBill.findByIdAndDelete(req.params.billId);
    await trader.save();

    res.json({ message: 'Bill deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Add Payment from Trader
router.post('/:id/payments', async (req, res) => {
  try {
    const trader = await Trader.findById(req.params.id);
    if (!trader) return res.status(404).json({ message: 'Trader not found' });

    const count = await TraderPayment.countDocuments();
    const receiptNumber = `TPR-${Date.now()}-${count + 1}`;

    const payment = new TraderPayment({
      traderId: req.params.id,
      billId: req.body.billId || null,
      date: req.body.date || Date.now(),
      amount: req.body.amount,
      receiptNumber,
      notes: req.body.notes
    });

    const savedPayment = await payment.save();

    // Decrease pending amount they owe us
    trader.balance -= req.body.amount;
    await trader.save();

    // If specific bill, update its paidAmount and status
    if (req.body.billId) {
      const bill = await TraderBill.findById(req.body.billId);
      if (bill) {
        bill.paidAmount += req.body.amount;
        if (bill.paidAmount >= bill.totalAmount) {
          bill.status = 'PAID';
        } else {
          bill.status = 'PARTIAL';
        }
        await bill.save();
      }
    }

    res.status(201).json(savedPayment);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update Payment
router.put('/:id/payments/:paymentId', async (req, res) => {
  try {
    const trader = await Trader.findById(req.params.id);
    if (!trader) return res.status(404).json({ message: 'Trader not found' });

    const payment = await TraderPayment.findById(req.params.paymentId);
    if (!payment) return res.status(404).json({ message: 'Payment not found' });

    const oldAmount = payment.amount;
    const oldBillId = payment.billId;

    if (req.body.amount !== undefined) payment.amount = req.body.amount;
    if (req.body.date) payment.date = req.body.date;
    if (req.body.notes !== undefined) payment.notes = req.body.notes;
    
    const savedPayment = await payment.save();

    // Update trader balance
    trader.balance -= (payment.amount - oldAmount);
    await trader.save();

    // If attached to a bill, update bill's paidAmount
    if (oldBillId) {
      const bill = await TraderBill.findById(oldBillId);
      if (bill) {
        bill.paidAmount += (payment.amount - oldAmount);
        bill.status = bill.paidAmount >= bill.totalAmount ? 'PAID' : (bill.paidAmount > 0 ? 'PARTIAL' : 'PENDING');
        await bill.save();
      }
    }

    res.json(savedPayment);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete Payment
router.delete('/:id/payments/:paymentId', async (req, res) => {
  try {
    const trader = await Trader.findById(req.params.id);
    if (!trader) return res.status(404).json({ message: 'Trader not found' });

    const payment = await TraderPayment.findById(req.params.paymentId);
    if (!payment) return res.status(404).json({ message: 'Payment not found' });

    // Increase trader balance (as payment is being removed)
    trader.balance += payment.amount;
    
    // If attached to a bill, update bill's paidAmount
    if (payment.billId) {
      const bill = await TraderBill.findById(payment.billId);
      if (bill) {
        bill.paidAmount -= payment.amount;
        bill.status = bill.paidAmount >= bill.totalAmount ? 'PAID' : (bill.paidAmount > 0 ? 'PARTIAL' : 'PENDING');
        await bill.save();
      }
    }

    await TraderPayment.findByIdAndDelete(req.params.paymentId);
    await trader.save();

    res.json({ message: 'Payment deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
