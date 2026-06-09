const Wallet = require('../models/Wallet');
const Transaction = require('../models/Transaction');
const User = require('../models/User');
const mongoose = require('mongoose');
const { createNotification } = require('../utils/notificationService');

// @desc    Get wallet info
// @route   GET /api/payments/wallet
// @access  Private
const getWallet = async (req, res) => {
  try {
    let wallet = await Wallet.findOne({ user: req.user.id });
    
    // Auto-create if missing
    if (!wallet) {
      wallet = await Wallet.create({ user: req.user.id });
    }
    
    console.log(`[DEBUG] Wallet Fetch: User=${req.user.id}, Balance=${wallet.balance}`);
    res.status(200).json(wallet);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Deposit funds
// @route   POST /api/payments/deposit
// @access  Private (Investor only)
const deposit = async (req, res) => {
  console.log('[DEBUG] Deposit Hit:', req.body);
  const { amount } = req.body;
  
  if (!amount || amount <= 0) {
    console.log('[DEBUG] Deposit Validation Failed:', amount);
    return res.status(400).json({ message: 'Valid amount greater than 0 required' });
  }

  try {
    const wallet = await Wallet.findOne({ user: req.user.id });
    if (!wallet) {
      console.log('[DEBUG] Wallet Not Found for:', req.user.id);
      return res.status(404).json({ message: 'Wallet not found' });
    }

    console.log('[DEBUG] Before Deposit:', wallet.balance);
    wallet.balance = Number((wallet.balance + amount).toFixed(2));
    wallet.totalDeposited = Number((wallet.totalDeposited + amount).toFixed(2));
    await wallet.save();
    console.log('[DEBUG] After Deposit:', wallet.balance);

    await Transaction.create({
      receiver: req.user.id,
      amount,
      type: 'deposit',
      status: 'completed',
      description: 'Funds deposit'
    });

    res.status(200).json(wallet);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Withdraw funds
// @route   POST /api/payments/withdraw
// @access  Private (Investor only)
const withdraw = async (req, res) => {
  const { amount } = req.body;
  
  if (!amount || amount <= 0) {
    return res.status(400).json({ message: 'Valid amount greater than 0 required' });
  }

  try {
    const wallet = await Wallet.findOne({ user: req.user.id });
    if (!wallet) return res.status(404).json({ message: 'Wallet not found' });

    console.log(`[DEBUG] Withdrawal: User=${req.user.id}, Attempting=${amount}, CurrentBalance=${wallet.balance}`);

    if (wallet.balance < amount) {
      console.log(`[DEBUG] Withdrawal FAILED: Insufficient funds. Balance=${wallet.balance}`);
      return res.status(400).json({ message: 'Insufficient balance' });
    }

    wallet.balance = Math.max(0, Number((wallet.balance - amount).toFixed(2)));
    wallet.totalWithdrawn = Number((wallet.totalWithdrawn + amount).toFixed(2));
    await wallet.save();

    console.log(`[DEBUG] Withdrawal SUCCESS: New Balance=${wallet.balance}`);

    await Transaction.create({
      sender: req.user.id,
      amount,
      type: 'withdraw',
      status: 'completed',
      description: 'Funds withdrawal'
    });

    res.status(200).json(wallet);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Transfer funds
// @route   POST /api/payments/transfer
// @access  Private (Investor only)
const transfer = async (req, res) => {
  const { receiverId, receiverEmail, amount, description } = req.body;
  
  if ((!receiverId && !receiverEmail) || !amount || amount <= 0) {
    return res.status(400).json({ message: 'Valid receiver (ID or Email) and amount required' });
  }
  
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    let finalReceiverId = receiverId;

    // Lookup by email if ID not provided
    if (!finalReceiverId && receiverEmail) {
      const user = await User.findOne({ email: receiverEmail }).session(session);
      if (!user) {
        await session.abortTransaction();
        return res.status(404).json({ message: 'Receiver not found' });
      }
      finalReceiverId = user._id;
    }

    if (finalReceiverId.toString() === req.user.id) {
      await session.abortTransaction();
      return res.status(400).json({ message: 'Cannot transfer funds to self' });
    }

    const senderWallet = await Wallet.findOne({ user: req.user.id }).session(session);
    const receiverWallet = await Wallet.findOne({ user: finalReceiverId }).session(session);

    if (!senderWallet || !receiverWallet) {
      await session.abortTransaction();
      return res.status(404).json({ message: 'One or both wallets not found' });
    }

    if (senderWallet.balance < amount) {
      await session.abortTransaction();
      return res.status(400).json({ message: 'Insufficient balance' });
    }

    senderWallet.balance = Number((senderWallet.balance - amount).toFixed(2));
    senderWallet.totalTransferred = Number((senderWallet.totalTransferred + amount).toFixed(2));
    receiverWallet.balance = Number((receiverWallet.balance + amount).toFixed(2));

    await senderWallet.save();
    await receiverWallet.save();

    const transaction = await Transaction.create([{
      sender: req.user.id,
      receiver: finalReceiverId,
      amount,
      type: 'transfer',
      status: 'completed',
      description
    }], { session });

    // Notify receiver
    await createNotification({
      recipient: finalReceiverId,
      sender: req.user.id,
      type: 'payment_received',
      title: 'Funds Received',
      message: `You have received $${amount} from ${req.user.name}`,
      relatedId: transaction[0]._id,
    });

    await session.commitTransaction();
    res.status(200).json({ message: 'Transfer successful', balance: senderWallet.balance });
  } catch (error) {
    await session.abortTransaction();
    res.status(500).json({ message: error.message });
  } finally {
    session.endSession();
  }
};

// @desc    Get transaction history
// @route   GET /api/payments/history
// @access  Private
const getHistory = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const transactions = await Transaction.find({
      $or: [{ sender: req.user.id }, { receiver: req.user.id }]
    })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

    res.status(200).json(transactions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getWallet,
  deposit,
  withdraw,
  transfer,
  getHistory
};
