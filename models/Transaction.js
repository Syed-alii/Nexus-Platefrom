const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null, // Null for deposits
    },
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null, // Null for withdrawals
    },
    amount: {
      type: Number,
      required: true,
    },
    type: {
      type: String,
      enum: ['deposit', 'withdraw', 'transfer'],
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed'],
      default: 'pending',
    },
    description: {
      type: String,
      trim: true,
    },
    referenceId: {
      type: String, // Useful for tracking external-like systems
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

transactionSchema.index({ sender: 1 });
transactionSchema.index({ receiver: 1 });
transactionSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Transaction', transactionSchema);
