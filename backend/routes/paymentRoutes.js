const express = require('express');
const router = express.Router();
const {
  getWallet,
  deposit,
  withdraw,
  transfer,
  getHistory
} = require('../controllers/paymentController');
const { protect } = require('../middleware/authMiddleware');
const { checkRole } = require('../middleware/roleMiddleware');

/**
 * @swagger
 * tags:
 *   name: Payments
 *   description: Wallet and transaction management
 */

/**
 * @swagger
 * /api/payments/wallet:
 *   get:
 *     summary: Get user wallet and balance
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Wallet data retrieved successfully
 */
router.get('/wallet', protect, checkRole(['investor', 'entrepreneur']), getWallet);

/**
 * @swagger
 * /api/payments/history:
 *   get:
 *     summary: Get transaction history
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Transaction history retrieved
 */
router.get('/history', protect, checkRole(['investor', 'entrepreneur']), getHistory);

/**
 * @swagger
 * /api/payments/deposit:
 *   post:
 *     summary: Deposit funds into wallet (Investor only)
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - amount
 *             properties:
 *               amount:
 *                 type: number
 *     responses:
 *       200:
 *         description: Deposit successful
 */
router.post('/deposit', protect, checkRole(['investor']), deposit);

/**
 * @swagger
 * /api/payments/withdraw:
 *   post:
 *     summary: Withdraw funds from wallet (Investor only)
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - amount
 *             properties:
 *               amount:
 *                 type: number
 *     responses:
 *       200:
 *         description: Withdrawal successful
 */
router.post('/withdraw', protect, checkRole(['investor']), withdraw);

/**
 * @swagger
 * /api/payments/transfer:
 *   post:
 *     summary: Transfer funds to another user (Investor only)
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - receiverId
 *               - amount
 *             properties:
 *               receiverId:
 *                 type: string
 *               amount:
 *                 type: number
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Transfer successful
 */
router.post('/transfer', protect, checkRole(['investor']), transfer);

module.exports = router;
