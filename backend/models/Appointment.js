const mongoose = require('mongoose');

// Definišemo šemu za termin
const appointmentSchema = new mongoose.Schema({
  datum: {
    type: Date,
    required: true,
  },
  vreme: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  ime: {
    type: String,
    required: true,
  },
  usluga: {
    type: String,
    required: true,
  },
  telefon: {
    type: String,
    required: true,
  },
});

// Kreiramo model na osnovu šeme
const Appointment = mongoose.model('Appointment', appointmentSchema);

module.exports = Appointment;