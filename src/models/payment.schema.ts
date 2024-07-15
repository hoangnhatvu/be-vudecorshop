import * as mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema({
  order_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true,
  },

  amount: {
    type: Number,
    required: true,
  },

  method: {
    type: String,
    required: true,
  },

  status: {
    type: String,
    enum: ['chưa thanh toán', 'đã thanh toán'],
    default: 'chưa thanh toán',
    required: true,
  },
  
  created_date: {
    type: Date,
    default: Date.now,
  },
});

const Payment = mongoose.model('Payment', paymentSchema);

module.exports = Payment;
