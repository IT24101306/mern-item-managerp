require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dns = require('dns');

const app = express();
const PORT = process.env.PORT || 5000;
const DB_RETRY_MS = Number(process.env.DB_RETRY_MS || 15000);

// Middleware
app.use(cors());
app.use(express.json());

// Routes
const itemsRouter = require('./routes/items');
app.use('/api/items', itemsRouter);

// Database Connection
const connectWithSrvFallback = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB Atlas');
  } catch (err) {
    const isSrvDnsError =
      err?.code === 'ECONNREFUSED' &&
      err?.syscall === 'querySrv' &&
      process.env.MONGO_URI?.startsWith('mongodb+srv://');

    if (!isSrvDnsError) {
      throw err;
    }

    console.warn(
      'SRV DNS lookup failed. Retrying MongoDB connection with fallback DNS servers...'
    );
    dns.setServers(['8.8.8.8', '1.1.1.1']);
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB Atlas (DNS fallback)');
  }
};

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

const tryConnectMongo = async () => {
  try {
    await connectWithSrvFallback();
  } catch (err) {
    console.error('Error connecting to MongoDB:', err.message || err);
  }
};

tryConnectMongo();
setInterval(async () => {
  if (mongoose.connection.readyState === 1) {
    return;
  }

  console.log('Retrying MongoDB connection...');
  await tryConnectMongo();
}, DB_RETRY_MS);
