const mongoose = require('mongoose');

const terminSchema = new mongoose.Schema({
  ime: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
  },
  datum: {
    type: Date,
    required: true,
  },
  vreme: {
    type: String,
    required: true,
  },
  usluga: { type: String, required: true }, 
  uslugaId:{ type: mongoose.Schema.Types.ObjectId, ref: 'Service', required: true },
  telefon: {
    type: String,
    required: true,
  },
}, { timestamps: true }); // Automatski dodaje createdAt i updatedAt

const Termin = mongoose.model('Termin', terminSchema);

module.exports = Termin; 