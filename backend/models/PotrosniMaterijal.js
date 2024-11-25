const mongoose = require('mongoose');

const PotrosniMaterijalSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  quantity: { type: Number, required: true },
});

module.exports = mongoose.model('PotrosniMaterijal', PotrosniMaterijalSchema);