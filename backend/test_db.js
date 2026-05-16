const mongoose = require('mongoose');
require('dotenv').config();

async function testConnection() {
  const uri = process.env.MONGODB_URI;
  console.log('Testing connection to:', uri.split('@')[1]); // Log part of URI for privacy
  try {
    await mongoose.connect(uri);
    console.log('✅ Connected');
    const Farmer = mongoose.model('Farmer', new mongoose.Schema({ name: String }));
    console.log('Testing find()...');
    const farmers = await Farmer.find().limit(1);
    console.log('✅ Query successful:', farmers);
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

testConnection();
