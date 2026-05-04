const mongoose = require('mongoose');

const PaymentSchema = new mongoose.Schema({
  studentName: { type: String, required: true },
  course:      { type: String, required: true },
  totalFee:    { type: String, required: true },
  amountPaid:  { type: String, required: true },
  balance:     { type: String, default: '0' },
  method:      { type: String, required: true },
  date:        { type: String, required: true },
  status:      { type: String, default: 'Pending' },
  idCode:      { type: String },
  color:       { type: String },
  slipImage:   { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Payment', PaymentSchema);
