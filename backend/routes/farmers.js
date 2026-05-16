const express = require('express');
const router = express.Router();
const Farmer = require('../models/Farmer');
const FarmerBill = require('../models/FarmerBill');
const FarmerPayment = require('../models/FarmerPayment');

// Get all farmers
router.get('/', async (req, res) => {
  try {
    const farmers = await Farmer.find().sort({ createdAt: -1 });
    res.json(farmers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Add new farmer
router.post('/', async (req, res) => {
  const farmer = new Farmer({
    name: req.body.name,
    phone: req.body.phone,
    address: req.body.address
  });
  try {
    const newFarmer = await farmer.save();
    res.status(201).json(newFarmer);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update farmer
router.put('/:id', async (req, res) => {
  try {
    const farmer = await Farmer.findById(req.params.id);
    if (!farmer) return res.status(404).json({ message: 'Farmer not found' });

    if (req.body.name) farmer.name = req.body.name;
    if (req.body.phone) farmer.phone = req.body.phone;
    if (req.body.address) farmer.address = req.body.address;

    const updatedFarmer = await farmer.save();
    res.json(updatedFarmer);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete farmer
router.delete('/:id', async (req, res) => {
  try {
    const farmer = await Farmer.findById(req.params.id);
    if (!farmer) return res.status(404).json({ message: 'Farmer not found' });

    // Delete related bills and payments
    await FarmerBill.deleteMany({ farmerId: req.params.id });
    await FarmerPayment.deleteMany({ farmerId: req.params.id });
    
    await Farmer.findByIdAndDelete(req.params.id);
    res.json({ message: 'Farmer and all related records deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get farmer details including bills and payments
router.get('/:id', async (req, res) => {
  try {
    const farmer = await Farmer.findById(req.params.id);
    if (!farmer) return res.status(404).json({ message: 'Farmer not found' });
    
    const bills = await FarmerBill.find({ farmerId: req.params.id }).sort({ date: -1 });
    const payments = await FarmerPayment.find({ farmerId: req.params.id }).sort({ date: -1 });
    
    res.json({ farmer, bills, payments });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Add Material In (Bill)
router.post('/:id/bills', async (req, res) => {
  try {
    const farmer = await Farmer.findById(req.params.id);
    if (!farmer) return res.status(404).json({ message: 'Farmer not found' });

    const totalAmount = req.body.weight * req.body.rate;
    const count = await FarmerBill.countDocuments();
    const billNumber = `FB-${Date.now()}-${count + 1}`;

    const bill = new FarmerBill({
      farmerId: req.params.id,
      billNumber,
      date: req.body.date || Date.now(),
      productName: req.body.productName,
      weight: req.body.weight,
      rate: req.body.rate,
      totalAmount
    });

    const savedBill = await bill.save();
    
    // Update farmer balance (increase pending amount)
    farmer.balance += totalAmount;
    await farmer.save();

    res.status(201).json(savedBill);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update Bill
router.put('/:id/bills/:billId', async (req, res) => {
  try {
    const farmer = await Farmer.findById(req.params.id);
    if (!farmer) return res.status(404).json({ message: 'Farmer not found' });

    const bill = await FarmerBill.findById(req.params.billId);
    if (!bill) return res.status(404).json({ message: 'Bill not found' });

    // Calculate difference in totalAmount to update farmer balance
    const oldTotal = bill.totalAmount;
    
    if (req.body.productName) bill.productName = req.body.productName;
    if (req.body.weight !== undefined) bill.weight = req.body.weight;
    if (req.body.rate !== undefined) bill.rate = req.body.rate;
    if (req.body.date) bill.date = req.body.date;

    bill.totalAmount = bill.weight * bill.rate;
    const newTotal = bill.totalAmount;

    const savedBill = await bill.save();

    // Update farmer balance
    farmer.balance += (newTotal - oldTotal);
    await farmer.save();

    res.json(savedBill);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete Bill
router.delete('/:id/bills/:billId', async (req, res) => {
  try {
    const farmer = await Farmer.findById(req.params.id);
    if (!farmer) return res.status(404).json({ message: 'Farmer not found' });

    const bill = await FarmerBill.findById(req.params.billId);
    if (!bill) return res.status(404).json({ message: 'Bill not found' });

    // Decrease farmer balance by the remaining unpaid amount of this bill?
    // Actually, balance tracks total debt. So we subtract the bill's total amount.
    farmer.balance -= bill.totalAmount;
    
    // BUT we also need to handle payments associated with this bill if any.
    // If we delete a bill, payments attached to it should probably be unlinked or deleted?
    // Let's just unlink them and adjust balance.
    // Actually, if we delete a bill, the farmer balance should decrease by the TOTAL amount of the bill,
    // and if there were payments made towards it, they still exist as general payments or should be deleted.
    // For simplicity, let's say deleting a bill also deletes its specific payments if they were ONLY for this bill.
    // However, the current model has `farmer.balance` which is `TotalBills - TotalPayments`.
    // So if we delete a bill, we just subtract its total from balance.
    
    await FarmerBill.findByIdAndDelete(req.params.billId);
    await farmer.save();

    res.json({ message: 'Bill deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Add Payment
router.post('/:id/payments', async (req, res) => {
  try {
    const farmer = await Farmer.findById(req.params.id);
    if (!farmer) return res.status(404).json({ message: 'Farmer not found' });

    const count = await FarmerPayment.countDocuments();
    const receiptNumber = `FPR-${Date.now()}-${count + 1}`;

    const payment = new FarmerPayment({
      farmerId: req.params.id,
      billId: req.body.billId || null,
      date: req.body.date || Date.now(),
      amount: req.body.amount,
      receiptNumber,
      notes: req.body.notes
    });

    const savedPayment = await payment.save();

    // Decrease pending amount
    farmer.balance -= req.body.amount;
    await farmer.save();

    // If specific bill, update its paidAmount and status
    if (req.body.billId) {
      const bill = await FarmerBill.findById(req.body.billId);
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
    const farmer = await Farmer.findById(req.params.id);
    if (!farmer) return res.status(404).json({ message: 'Farmer not found' });

    const payment = await FarmerPayment.findById(req.params.paymentId);
    if (!payment) return res.status(404).json({ message: 'Payment not found' });

    const oldAmount = payment.amount;
    const oldBillId = payment.billId;

    if (req.body.amount !== undefined) payment.amount = req.body.amount;
    if (req.body.date) payment.date = req.body.date;
    if (req.body.notes !== undefined) payment.notes = req.body.notes;
    // Note: Changing billId during update is complex, we'll keep it simple or restricted.
    
    const savedPayment = await payment.save();

    // Update farmer balance
    farmer.balance -= (payment.amount - oldAmount);
    await farmer.save();

    // If attached to a bill, update bill's paidAmount
    if (oldBillId) {
      const bill = await FarmerBill.findById(oldBillId);
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
    const farmer = await Farmer.findById(req.params.id);
    if (!farmer) return res.status(404).json({ message: 'Farmer not found' });

    const payment = await FarmerPayment.findById(req.params.paymentId);
    if (!payment) return res.status(404).json({ message: 'Payment not found' });

    // Increase farmer balance (as payment is being removed)
    farmer.balance += payment.amount;
    
    // If attached to a bill, update bill's paidAmount
    if (payment.billId) {
      const bill = await FarmerBill.findById(payment.billId);
      if (bill) {
        bill.paidAmount -= payment.amount;
        bill.status = bill.paidAmount >= bill.totalAmount ? 'PAID' : (bill.paidAmount > 0 ? 'PARTIAL' : 'PENDING');
        await bill.save();
      }
    }

    await FarmerPayment.findByIdAndDelete(req.params.paymentId);
    await farmer.save();

    res.json({ message: 'Payment deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
