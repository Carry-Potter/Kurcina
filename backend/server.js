
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt'); // Za hashovanje lozinki
const jwt = require('jsonwebtoken'); // Za generisanje tokena
const User = require('./models/User'); // Model za korisnika
const Termin = require('./models/termin'); // Importujte model za termin
const WorkingHours = require('./models/WorkingHours'); 
const Service = require('./models/Service'); 
const Appointment = require('./models/Appointment');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const session = require('express-session'); 
const Promotion = require('./models/Promotion');
const PotrosniMaterijal = require('./models/PotrosniMaterijal');

const app = express();
const PORT = process.env.PORT || 5000;
const nodemailer = require('nodemailer');

// Middleware
app.use(cors({
  origin: 'https://frizerski-frontend.onrender.com',
  credentials: true, // Omogućava slanje kolačića i autorizacije
}));
app.use(bodyParser.json());

// Konfiguracija express-session
app.use(session({
  secret: 'your_secret_key', // Zamenite sa vašim tajnim ključem
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false } // Postavite na true ako koristite HTTPS
}));
// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Middleware za logovanje
app.use((req, res, next) => {
  console.log(`Request Method: ${req.method}, Request URL: ${req.url}`);
  if (req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH') {
    console.log('Request Body:', req.body);
  }
  next(); // Nastavljamo na sledeći middleware ili rutu
});

// Povezivanje sa MongoDB
const uri = process.env.MONGO_URI;

const transporter = nodemailer.createTransport({
  service: 'gmail', // Možete koristiti i druge servise
  auth: {
    user: 'ivan.jelic.dvlpr@gmail.com', // Vaš email
    pass: process.env.EMAIL_PASSWORD, // Vaša lozinka ili aplikacijska lozinka
  },
});


const seedWorkingHours = async () => {
  const demoHours = [
    { day: 'Ponedeljak', open: '09:00', close: '17:00', isClosed: false },
    { day: 'Utorak', open: '09:00', close: '17:00', isClosed: false },
    { day: 'Sreda', open: '09:00', close: '17:00', isClosed: false },
    { day: 'Četvrtak', open: '09:00', close: '17:00', isClosed: false },
    { day: 'Petak', open: '09:00', close: '17:00', isClosed: false },
    { day: 'Subota', open: null, close: null, isClosed: true }, // Neradna subota
    { day: 'Nedelja', open: null, close: null, isClosed: true }, // Neradna nedelja
  ];

  for (const hour of demoHours) {
    const existingHour = await WorkingHours.findOne({ day: hour.day });
    if (!existingHour) {
      const newWorkingHour = new WorkingHours(hour);
      await newWorkingHour.save();
    }
  }
};

mongoose.connect(uri)
  .then(async () => {
    console.log('Uspešno povezano sa MongoDB Atlas');
    // Dodajte demo podatke
  })
  .catch((err) => console.error('Detaljna greška pri povezivanju sa MongoDB Atlas:', err));
  

// Middleware za autentifikaciju
const authenticateToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  console.log('Token:', token);
  if (!token) return res.sendStatus(401);

  jwt.verify(token, 'your_jwt_secret', (err, user) => {
    if (err) {
      console.error('Greška pri verifikaciji tokena:', err);
      return res.sendStatus(403);
    }
    req.user = user;
    next();
  });
};

// Middleware za admin autentifikaciju
const authenticateAdmin = (req, res, next) => {
  if (req.user && req.user.email === 'admin@gmail.com') {
    return next(); // Ako je admin, nastavi dalje
  }
  return res.status(403).json({ message: 'Zabranjen pristup' }); // Ako nije admin, vrati 403
};
// Nova ruta za proveru zauzetih termina
app.get('/zauzeti-termini', async (req, res) => {
  try {
    const { datum } = req.query;
    const pocetakDana = new Date(datum);
    pocetakDana.setDate(pocetakDana.getDate() ); // Pomerite datum za jedan dan unapred
    pocetakDana.setHours(0, 0, 0, 0); // Postavite vreme na početak dana
    const krajDana = new Date(pocetakDana); // Kraj dana je sada novi datum
    krajDana.setHours(23, 59, 59, 999); // Postavite vreme na kraj dana

    console.log('Pretražujem termine od:', pocetakDana, 'do:', krajDana); // Dodajte ovo

    const zauzetiTermini = await Termin.find({
      datum: {
        $gte: pocetakDana,
        $lte: krajDana
      }
    }, 'vreme');

    console.log('Pronađeni zauzeti termini:', zauzetiTermini); // Dodajte ovo

    res.json(zauzetiTermini.map(t => t.vreme));
  } catch (error) {
    console.error('Greška:', error); // Dodajte ovo
    res.status(500).json({ message: 'Greška pri dobijanju zauzetih termina', error: error.message });
  }
});
// Nova ruta za dobijanje termina od danas
app.get('/termini-od-danas', async (req, res) => {
  try {
    const danas = new Date();
    danas.setHours(0, 0, 0, 0); // Postavite vreme na početak dana
    const termini = await Termin.find({ datum: { $gte: danas } });
    res.json(termini);
  } catch (error) {
    res.status(500).json({ message: 'Greška pri dobijanju termina', error: error.message });
  }
});

// Ruta za kreiranje novog termina
app.post('/termini', async (req, res) => { 
  console.log('Primljeni podaci:', req.body); // Dodajte ovo
  try {
    const { datum, vreme, email, ime, usluga, uslugaId, telefon } = req.body; 

    // Proverite da li je termin već zauzet
    const postojeciTermin = await Termin.findOne({ datum: new Date(datum), vreme });
    if (postojeciTermin) {
      return res.status(400).json({ message: 'Termin je već zauzet' });
    }

    // Konvertujte vreme u 24-časovni format
    const [time, modifier] = vreme.split(' '); // Razdvojite vreme i AM/PM
    let [hours, minutes] = time.split(':'); // Razdvojite sate i minute

    if (modifier === 'PM' && hours !== '12') {
      hours = parseInt(hours, 10) + 12; // Dodajte 12 za PM
    }
    if (modifier === 'AM' && hours === '12') {
      hours = '0'; // Postavite 12 AM na 0
    }

    // Kombinujte datum i vreme u jedan Date objekat
    const appointmentDateTime = new Date(datum);
    appointmentDateTime.setHours(parseInt(hours, 10)); // Osigurajte da je hours broj
    appointmentDateTime.setMinutes(parseInt(minutes, 10)); // Osigurajte da je minutes broj

    const noviTermin = new Termin({
      datum: appointmentDateTime, // Koristite kombinovani datum i vreme
      vreme,
      email,
      ime,
      usluga,
      uslugaId,
      telefon,
    });
    await noviTermin.save();

    // Zakazivanje podsetnika pola sata pre termina
    const reminderTime = new Date(appointmentDateTime);
    reminderTime.setMinutes(reminderTime.getMinutes() - 30); // Pomerite vreme za 30 minuta unapred

    // Izračunajte koliko vremena je preostalo do slanja podsetnika
    const timeUntilReminder = reminderTime - new Date();

    // Ispisivanje kada će podsetnik biti poslat
    console.log(`Podsetnik će biti poslat ${reminderTime.toLocaleString()} za ${usluga}.`);

    // Zakazivanje podsetnika koristeći setTimeout
    if (timeUntilReminder > 0) {
      setTimeout(async () => {
        try {
          await sendReminder(email, appointmentDateTime.toLocaleString(), usluga);
          console.log('Podsetnik uspešno poslat korisniku:', email);
        } catch (error) {
          console.error('Greška pri slanju podsetnika:', error);
        }
      }, timeUntilReminder);
    }

    res.status(201).json({ message: 'Termin uspešno zakazan', termin: noviTermin });
  } catch (error) {
    console.error('Greška pri čuvanju termina:', error);
    res.status(400).json({ message: 'Greška prilikom zakazivanja termina', error: error.message });
  }
});

// Ruta za dobijanje svih termina (opciono, za testiranje)
app.get('/termini', authenticateToken, async (req, res) => { // Zaštićena ruta
  try {
    const termini = await Termin.find();
    res.json(termini);
  } catch (error) {
    res.status(500).json({ message: 'Greška pri dobijanju termina', error: error.message });
  }
});

// Nova ruta za dobijanje termina za određeni dan
app.get('/termini-po-danu', authenticateToken, async (req, res) => { // Zaštićena ruta
  try {
    const { datum } = req.query;
    const pocetakDana = new Date(datum);
    pocetakDana.setHours(0, 0, 0, 0);
    const krajDana = new Date(datum);
    krajDana.setHours(23, 59, 59, 999);

    const termini = await Termin.find({
      datum: {
        $gte: pocetakDana,
        $lte: krajDana
      }
    }).sort({ vreme: 1 });

    res.json(termini);
  } catch (error) {
    res.status(500).json({ message: 'Greška pri dobijanju termina', error: error.message });
  }
});



// Ruta za logovanje
app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Korisnik ne postoji' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Pogrešna lozinka' });
    }

    const token = jwt.sign({ id: user._id }, 'your_jwt_secret', { expiresIn: '1h' });
    res.json({ user, token });
  } catch (error) {
    res.status(500).json({ message: 'Greška na serveru' });
  }
});

// Ruta za registraciju
app.post('/register', async (req, res) => {
  console.log('Primljeni podaci za registraciju:', req.body); // Dodajte ovo
  const { firstName, lastName, email, password, phone } = req.body;
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Korisnik već postoji' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ firstName, lastName, email, password: hashedPassword, phone });
    await newUser.save();

    const token = jwt.sign({ id: newUser._id }, 'your_jwt_secret', { expiresIn: '1h' });

    // Slanje obaveštenja na mejl
    const mailOptions = {
      from: 'your_email@gmail.com', // Vaš email
      to: email, // Email korisnika
      subject: 'Uspešna registracija',
      text: `Poštovani ${firstName},\n\nUspešno ste se registrovali na našu platformu!\n\nHvala vam!\n\nPozdrav,\nTim`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('Greška pri slanju mejla:', error);
      } else {
        console.log('Obaveštenje poslato:', info.response);
      }
    });

    res.status(201).json({ user: newUser, token });
  } catch (error) {
    console.error('Greška pri registraciji:', error); // Dodajte ovo
    res.status(500).json({ message: 'Greška na serveru' });
  }
});

// Ažuriranje radnog vremena
app.put('/working-hours', authenticateToken, async (req, res) => {
  const updates = req.body; // Očekujemo niz objekata
  try {
    const updatedHours = await Promise.all(updates.map(async ({ day, open, close }) => {
      return await WorkingHours.findOneAndUpdate(
        { day },
        { open, close },
        { new: true, upsert: true } // Ažurira ili kreira novi dokument
      );
    }));
    res.json(updatedHours);
  } catch (error) {
    res.status(500).json({ message: 'Greška pri ažuriranju radnog vremena', error: error.message });
  }
});

// Dobijanje radnog vremena
app.get('/working-hours',  async (req, res) => {
  try {
    const workingHours = await WorkingHours.find();
    res.json(workingHours); // Uverite se da je workingHours niz
  } catch (error) {
    res.status(500).json({ message: 'Greška pri dobijanju radnog vremena', error: error.message });
  }
});

// Ruta za kreiranje radnog vremena
app.post('/working-hours', authenticateToken, async (req, res) => {
  const { day, open, close } = req.body;
  try {
    const newWorkingHour = new WorkingHours({ day, open, close });
    await newWorkingHour.save();
    res.status(201).json(newWorkingHour);
  } catch (error) {
    res.status(500).json({ message: 'Greška pri kreiranju radnog vremena', error: error.message });
  }
});

// Serijalizacija korisnika
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Deserijalizacija korisnika
passport.deserializeUser(async (id, done) => {
  const user = await User.findById(id);
  done(null, user);
});



passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID, // Zamenite sa vašim Client ID
  clientSecret: process.env.GOOGLE_CLIENT_SECRET, // Zamenite sa vašim Client Secret
  callbackURL: '/auth/google/callback',
}, async (accessToken, refreshToken, profile, done) => {
  try {
    // Proverite da li korisnik već postoji u bazi
    let user = await User.findOne({ googleId: profile.id });
    if (!user) {
      // Ako ne postoji, kreirajte novog korisnika
      user = new User({
        firstName: profile.name.givenName,
        lastName: profile.name.familyName,
        email: profile.emails[0].value,
        googleId: profile.id,
      });
      await user.save();
    }
    done(null, user);
  } catch (error) {
    done(error, null);
  }
}));

// Ruta za prijavu putem Google-a
app.get('/auth/google', passport.authenticate('google', {
  scope: ['profile', 'email'],
}));

// Ruta za povratak nakon prijave
app.get('/auth/google/callback', passport.authenticate('google', {
  failureRedirect: '/login',
}), (req, res) => {
  // Uspesna prijava, preusmerite na frontend stranicu
  res.redirect(`https://frizerski-frontend.onrender.com/?user=${encodeURIComponent(JSON.stringify(req.user))}`);
});

// Ruta za prijavu
app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'Korisnik nije pronađen' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Pogrešna lozinka' });
    }

    const token = jwt.sign({ id: user._id, email: user.email }, 'your_jwt_secret', { expiresIn: '1h' });
    res.json({ token, user });
  } catch (error) {
    res.status(500).json({ message: 'Greška pri prijavi', error: error.message });
  }
});

// Ruta za kreiranje nove usluge
app.post('/services', authenticateToken, async (req, res) => {
  const { name, gender, duration, price } = req.body;
  try {
    const newService = new Service({ name, gender, duration, price });
    await newService.save();
    res.status(201).json(newService);
  } catch (error) {
    res.status(400).json({ message: 'Greška pri kreiranju usluge', error: error.message });
  }
});



// Ruta za brisanje usluge
app.delete('/services/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    await Service.findByIdAndDelete(id);
    res.status(204).send(); // No Content
  } catch (error) {
    res.status(500).json({ message: 'Greška pri brisanju usluge', error: error.message });
  }
});

// Ruta za dobijanje usluge po ID-u
app.get('/services/:id', async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) {
      return res.status(404).json({ message: 'Usluga nije pronađena' });
    }
    res.json(service);
  } catch (error) {
    res.status(500).json({ message: 'Greška pri dobijanju usluge', error: error.message });
  }
});


// Ruta za dobijanje svih usluga (javna ruta)
app.get('/services', async (req, res) => {
  try {
    const services = await Service.find();
    res.json(services);
  } catch (error) {
    res.status(500).json({ message: 'Greška pri dobijanju usluga', error: error.message });
  }
});






// Ruta za ažuriranje usluge
app.put('/services/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { name, gender, duration, price } = req.body;
  try {
    const updatedService = await Service.findByIdAndUpdate(id, { name, gender, duration, price }, { new: true });
    res.json(updatedService);
  } catch (error) {
    res.status(400).json({ message: 'Greška pri ažuriranju usluge', error: error.message });
  }
});


// Ruta za dobijanje broja zakazanih termina po mesecima
app.get('/zakazani-termini-po-mesecima', async (req, res) => {
  try {
    const termini = await Termin.aggregate([
      {
        $group: {
          _id: { $month: "$datum" },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    const result = termini.map(item => ({
      month: item._id,
      count: item.count
    }));

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: 'Greška pri dobijanju termina', error: error.message });
  }
});
app.get('/ukupna-zarada-po-mesecima', async (req, res) => {
  try {
    const zarada = await Termin.aggregate([
      {
        $lookup: {
          from: 'services', // Ime kolekcije usluga
          localField: 'uslugaId', // Polje u kolekciji termina
          foreignField: '_id', // Polje u kolekciji usluga
          as: 'usluga' // Ime novog polja koje će sadržati uslugu
        }
      },
      {
        $unwind: '$usluga' // Razvijanje usluge u pojedinačne dokumente
      },
      {
        $group: {
          _id: { $month: "$datum" }, // Grupisanje po mesecu
          totalEarnings: { $sum: "$usluga.price" } // Sumiranje cene usluga
        }
      },
      {
        $sort: { _id: 1 } // Sortiranje po mesecu
      }
    ]);

    const result = zarada.map(item => ({
      month: item._id,
      totalEarnings: item.totalEarnings
    }));

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: 'Greška pri dobijanju ukupne zarade', error: error.message });
  }
});
// Ruta za dobijanje prosečnog vremena trajanja termina
app.get('/prosecno-vreme-termina', async (req, res) => {
  try {
    const termini = await Termin.aggregate([
      {
        $group: {
          _id: null,
          averageDuration: { $avg: "$vreme" } // Koristite polje "vreme"
        }
      }
    ]);
    
    res.json({ averageDuration: termini[0]?.averageDuration || 0 });
  } catch (error) {
    res.status(500).json({ message: 'Greška pri dobijanju prosečnog vremena', error: error.message });
  }
});

// Ruta za dobijanje najpopularnijih usluga
app.get('/najpopularnije-usluge', async (req, res) => {
  try {
    const usluge = await Termin.aggregate([
      {
        $group: {
          _id: "$usluga", // Pretpostavljamo da imate usluga polje u modelu Appointment
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      },
      {
        $limit: 5 // Vraća top 5 najpopularnijih usluga
      }
    ]);
    
    res.json(usluge);
  } catch (error) {
    res.status(500).json({ message: 'Greška pri dobijanju najpopularnijih usluga', error: error.message });
  }
});

// Ruta za dobijanje termina koje je korisnik zakazao od danas
app.get('/termini-od-danas', authenticateToken, async (req, res) => {
  try {
    const danas = new Date();
    danas.setHours(0, 0, 0, 0); // Postavite vreme na početak dana
    const termini = await Termin.find({
      email: req.user.email, // Filtrirajte termine po emailu korisnika
      datum: { $gte: danas } // Samo termini od danas
    });
    res.json(termini);
  } catch (error) {
    res.status(500).json({ message: 'Greška pri dobijanju termina', error: error.message });
  }
});
// Ruta za otkazivanje termina
app.delete('/termini/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const deletedTermin = await Termin.findByIdAndDelete(id);
    if (!deletedTermin) {
      return res.status(404).json({ message: 'Termin nije pronađen' });
    }
    res.status(204).send(); // No Content
  } catch (error) {
    res.status(500).json({ message: 'Greška pri otkazivanju termina', error: error.message });
  }
});

// Ruta za dobijanje aktivnih promocija
app.get('/promotions', async (req, res) => {
  try {
    const today = new Date();
    const promotions = await Promotion.find({
      endDate: { $gte: today } // Samo aktivne promocije
    });
    res.json(promotions);
  } catch (error) {
    res.status(500).json({ message: 'Greška pri dobijanju promocija', error: error.message });
  }
});
// Ruta za kreiranje nove promocije
app.post('/promotions', authenticateToken, async (req, res) => {
  const { service, startDate, endDate, requiredAppointments, freeAppointments } = req.body;
  try {
    const newPromotion = new Promotion({
      service,
      startDate,
      endDate,
      requiredAppointments,
      freeAppointments,
    });
    await newPromotion.save();
    res.status(201).json(newPromotion);
  } catch (error) {
    res.status(400).json({ message: 'Greška pri kreiranju promocije', error: error.message });
  }
});
// Ruta za dobijanje korisnika koji su zakazali termine za aktivne promocije
app.get('/promotion-users', async (req, res) => {
  try {
    const today = new Date();
    const promotions = await Promotion.find({
      endDate: { $gte: today } // Samo aktivne promocije
    });

    const usersWithPromotions = {};

    for (const promotion of promotions) {
      const termini = await Termin.find({
        usluga: promotion.service,
        datum: { $gte: promotion.startDate, $lte: promotion.endDate }
      });

      termini.forEach(termin => {
        const userEmail = termin.email; // Email korisnika
        if (!usersWithPromotions[userEmail]) {
          usersWithPromotions[userEmail] = {
            email: userEmail,
            service: promotion.service,
            count: 0
          };
        }
        usersWithPromotions[userEmail].count++; // Povećaj broj zakazanih termina
      });
    }

    // Pretvaranje objekta u niz
    const result = Object.values(usersWithPromotions);
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: 'Greška pri dobijanju korisnika za promocije', error: error.message });
  }
});

app.get('/all-users', async (req, res) => {
  try {
    const users = await User.find(); // Uzimanje svih korisnika iz baze
    res.json(users);
  } catch (error) {
    console.error('Greška prilikom dobijanja korisnika:', error);
    res.status(500).json({ message: 'Greška prilikom dobijanja korisnika' });
  }
});
app.get('/magacin', authenticateToken, async (req, res) => {
  try {
    const items = await PotrosniMaterijal.find(); // Pretpostavljamo da imate model PotrosniMaterijal
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: 'Greška pri dobijanju stavki u magacinu', error: error.message });
  }
});

// Ruta za dodavanje nove stavke u magacin
app.post('/magacin', authenticateToken, async (req, res) => {
  const { code, name, quantity } = req.body;
  try {
    const newItem = new PotrosniMaterijal({ code, name, quantity });
    await newItem.save();
    res.status(201).json(newItem);
  } catch (error) {
    res.status(500).json({ message: 'Greška pri dodavanju stavke u magacin', error: error.message });
  }
});
app.put('/magacin/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { code, name, quantity } = req.body;
  try {
    const updatedItem = await PotrosniMaterijal.findByIdAndUpdate(id, { code, name, quantity }, { new: true });
    res.json(updatedItem);
  } catch (error) {
    res.status(400).json({ message: 'Greška pri ažuriranju stavke', error: error.message });
  }
});
// Ruta za brisanje stavke u magacinu
app.delete('/api/magacin/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  try {
    await PotrosniMaterijal.findByIdAndDelete(id);
    res.status(204).send(); // Uspešno obrisano
  } catch (error) {
    res.status(500).json({ message: 'Greška pri brisanju stavke', error: error.message });
  }
});
// Ruta za zahtev za resetovanje lozinke
// Ruta za zahtev za resetovanje lozinke
app.post('/reset-password', async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Korisnik ne postoji' });
    }

    // Generišite token za resetovanje lozinke
    const token = jwt.sign({ id: user._id }, 'your_jwt_secret', { expiresIn: '1h' });

    // Link za resetovanje lozinke
    const resetLink = `https://frizerski-frontend.onrender.com/reset-password/${token}`;

    // Slanje mejla sa linkom za resetovanje lozinke
    const mailOptions = {
      from: 'ivan.jelic.dvlpr@gmail.com', // Vaš email
      to: email,
      subject: 'Resetovanje lozinke',
      text: `Poštovani,\n\nKliknite na link ispod da resetujete svoju lozinku:\n${resetLink}\n\nHvala!`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('Greška pri slanju mejla:', error);
        return res.status(500).json({ message: 'Greška pri slanju mejla' });
      }
      console.log('Obaveštenje poslato:', info.response);
      res.status(200).json({ message: 'Link za resetovanje lozinke je poslat na vaš email.' });
    });
  } catch (error) {
    console.error('Greška pri slanju linka za resetovanje lozinke:', error);
    res.status(500).json({ message: 'Greška na serveru' });
  }
});




// Ruta za promenu lozinke
app.post('/change-password/:token', async (req, res) => {
  const { token } = req.params;
  const { newPassword } = req.body;

  try {
    const decoded = jwt.verify(token, 'your_jwt_secret');
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(400).json({ message: 'Korisnik ne postoji' });
    }

    // Hashovanje nove lozinke
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    res.status(200).json({ message: 'Lozinka uspešno promenjena' });
  } catch (error) {
    console.error('Greška pri promeni lozinke:', error);
    res.status(500).json({ message: 'Greška na serveru' });
  }
});



const cron = require('node-cron');

// Funkcija za slanje podsetnika
const sendReminder = (email, appointmentTime, service) => {
  const mailOptions = {
    from: 'ivan.jelic.dvlpr@gmail.com', // Vaš email
    to: email,
    subject: 'Podsetnik na zakazan termin',
    text: `Podsećamo vas da imate zakazan termin za ${service} u ${appointmentTime}.`,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error('Greška pri slanju podsetnika:', error);
    } else {
      console.log('Podsetnik poslat:', info.response);
    }
  });
};

app.put('/update-user', authenticateToken, async (req, res) => {
  const { firstName, lastName, email, phone } = req.body;
  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id, // Koristimo ID korisnika iz tokena
      { firstName, lastName, email, phone },
      { new: true } // Vraća ažurirani dokument
    );

    if (!updatedUser) {
      return res.status(404).json({ message: 'Korisnik nije pronađen' });
    }

    res.json(updatedUser);
  } catch (error) {
    console.error('Greška pri ažuriranju korisnika:', error);
    res.status(500).json({ message: 'Greška pri ažuriranju korisnika', error: error.message });
  }
});



// Pokretanje servera
app.listen(PORT, () => {
  console.log(`Server radi na portu ${PORT}`);
});

// Omogućava CORS za sve OPTIONS zahteve
app.options('*', cors());


