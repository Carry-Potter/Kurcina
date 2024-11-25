const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
  name: { type: String, required: true },
  gender: { type: String, enum: ['Muškarac', 'Žena'], required: true },
  duration: { type: Number, required: true }, // Trajanje u minutima
  price: { type: Number, required: true },
});

const Service = mongoose.model('Service', serviceSchema);
module.exports = Service;