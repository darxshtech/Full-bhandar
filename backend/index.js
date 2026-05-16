const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());

// Request Logger
app.use((req, res, next) => {
  console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.url}`);
  next();
});

// Routes
const farmersRouter = require('./routes/farmers');
const tradersRouter = require('./routes/traders');
const dashboardRouter = require('./routes/dashboard');

app.use('/api/farmers', farmersRouter);
app.use('/api/traders', tradersRouter);
app.use('/api/dashboard', dashboardRouter);

// Connect to MongoDB
const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/agro_material_management';
  try {
    await mongoose.connect(uri);
    console.log('✅ MongoDB connected successfully');
  } catch (err) {
    console.error('❌ MongoDB Connection Error:');
    console.error(err.message);
    console.log('\n--- Troubleshooting Tip ---');
    console.log('If you see "ReplicaSetNoPrimary", your IP is likely not whitelisted in MongoDB Atlas.');
    console.log('To test locally, install MongoDB and change MONGODB_URI in .env to:');
    console.log('mongodb://localhost:27017/agro_material_management');
    console.log('---------------------------\n');
  }
};

connectDB();

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

module.exports = app;
