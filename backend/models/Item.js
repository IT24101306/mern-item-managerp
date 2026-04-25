const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  // TODO (Student): Add the missing fields based on the instructions.md
  // 1. description
  // 2. category
}, { timestamps: true });

module.exports = mongoose.model('Item', itemSchema);
