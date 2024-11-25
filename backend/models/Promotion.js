// zakazivanje/backend/models/Promotion.js
const mongoose = require('mongoose');

const promotionSchema = new mongoose.Schema({
  service: {
    type: String,
    required: true,
  },
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
    required: true,
  },
  requiredAppointments: {
    type: Number,
    required: true,
  },
  freeAppointments: {
    type: Number,
    required: true,
  },
}, { timestamps: true });

const Promotion = mongoose.model('Promotion', promotionSchema);

module.exports = Promotion;
