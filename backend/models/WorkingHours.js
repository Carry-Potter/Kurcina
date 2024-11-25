const mongoose = require('mongoose');

const workingHoursSchema = new mongoose.Schema({
  day: { type: String, required: true },
  open: { type: String, required: false },
  close: { type: String, required: false },
  isClosed: { type: Boolean, default: false },
});

module.exports = mongoose.model('WorkingHours', workingHoursSchema);
