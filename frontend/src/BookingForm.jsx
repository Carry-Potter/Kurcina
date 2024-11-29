
import { Link } from 'react-router-dom';
import React, { useState,useContext, useEffect } from 'react'


import API_ENDPOINTS from './apiConfig';
import DatePicker from 'react-datepicker'; // {{ edit_1 }}
import 'react-datepicker/dist/react-datepicker.css';
export default function BookingForm()   {
  const [gender, setGender] = useState('Muškarac'); // Dodajte stanje za pol
  const [services, setServices] = useState([]); // Stanje za usluge
  const [selectedServices, setSelectedServices] = useState([]);
  const [phone, setPhone] = useState('')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [date, setDate] = useState(null); // Postavite na null
  const [time, setTime] = useState('');
  const [service, setService] = useState('')
  const [zauzetiTermini, setZauzetiTermini] = useState([]);
 
  const [currentImageIndex, setCurrentImageIndex] = useState(null); // Koristimo null da označimo da nijedna slika nije izabrana
  const [user, setUser] = useState(null);
  const [workingHours, setWorkingHours] = useState([]);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    const fetchWorkingHours = async () => {
      const response = await fetch(API_ENDPOINTS.WORKING_HOURS, {
        method: 'GET',
      });
      const data = await response.json();
      setWorkingHours(data);
    };

    fetchWorkingHours();
  }, []);

  const isWorkingDay = (date) => {
    const dayOfWeek = new Date(date).getDay();
    const workingDay = workingHours.find(hours => {
      const dayNames = ["Nedelja", "Ponedeljak", "Utorak", "Sreda", "Četvrtak", "Petak", "Subota"];
      return hours.day === dayNames[dayOfWeek] && hours.open !== null;
    });
    return workingDay !== undefined;
  };
 
  

  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    const userParam = queryParams.get('user');
    if (userParam) {
      const user = JSON.parse(decodeURIComponent(userParam));
      localStorage.setItem('user', JSON.stringify(user)); // Sačuvajte korisničke podatke
      setUser(user); // Postavite korisnika u stanje
    }
  }, []);
  useEffect(() => {
    const loggedUser = JSON.parse(localStorage.getItem('user'));
    if (loggedUser) {
      setUser(loggedUser);
      setEmail(loggedUser.email);
      setName(loggedUser.firstName);
      setPhone(loggedUser.phone);
    }
  }, []);

  
  // Učitajte radno vreme iz baze (javna ruta)
  useEffect(() => {
    const fetchWorkingHours = async () => {
      const response = await fetch(API_ENDPOINTS.WORKING_HOURS, {
        method: 'GET',
      });
      const data = await response.json();
      setWorkingHours(data);
    };

    fetchWorkingHours();
  }, []);

   // Filtrirajte usluge prema odabranom polu
   useEffect(() => {
    const filteredServices = services.filter(service => service.gender === gender);
    setSelectedServices(filteredServices);
  }, [gender, services]);

  const fetchZauzetiTermini = async (datum) => {
    const token = localStorage.getItem('token');
    try {
        const response = await fetch(`${API_ENDPOINTS.ZAUZETI_TERMINI}?datum=${datum}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            throw new Error('Greška pri dobijanju zauzetih termina');
        }

        const data = await response.json();
        console.log('Prijem podataka sa servera:', data); // Dodajte log za proveru

        // Postavite zauzete termine direktno
        setZauzetiTermini(data); // Postavljamo direktno jer je data niz stringova
        console.log('Pronađeni zauzeti termini:', data); // Dodajte log za proveru
    } catch (error) {
        console.error('Greška:', error);
    }
};

const handleDateChange = (date) => {
  if (date && isWorkingDay(date)) {
      setDate(date);
      fetchZauzetiTermini(date.toISOString()); // Prosledi datum u ISO formatu
 
      
  } else {
      alert('Izabrani datum nije radni dan. Molimo izaberite drugi datum.');
  }
};

const filterTime = (time) => {
  const timeString = time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
  return !zauzetiTermini.includes(timeString);
};

  
 
const handleServiceChange = (serviceId) => {
  setSelectedServices(prev => 
    prev.includes(serviceId) ? prev.filter(s => s !== serviceId) : [...prev, serviceId]
  );
};


const handleSubmit = async (event) => {
  event.preventDefault(); // Sprečava podrazumevano ponašanje forme

  // Proverite da li su svi potrebni podaci uneti
  if (!name || !email || !date || !time || selectedServices.length === 0 || !phone) {
    alert('Molimo popunite sve podatke.');
    return;
  }

  // Proverite da li je vreme u ispravnom formatu
  const timeString = time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  if (zauzetiTermini.includes(timeString)) {
    alert('Izabrani termin je već zauzet. Molimo izaberite drugi termin.');
    return;
  }

  try {
    const appointmentPromises = selectedServices.map(async (serviceId, index) => {
      const service = services.find(s => s._id === serviceId);
      if (!service) return; // Ako usluga ne postoji, preskočite

      // Izračunajte novo vreme za svaki termin
      const appointmentTime = new Date(date); // Koristimo datum koji je korisnik izabrao
      appointmentTime.setHours(time.getHours(), time.getMinutes());
      if (index === 0) {
        // Postavljamo vreme direktno iz odabranog vremena za prvu uslugu
        appointmentTime.setHours(time.getHours(), time.getMinutes());
      } else {
        // Za svaku sledeću uslugu dodajte vreme trajanja prethodne usluge
        const previousService = services.find(s => s._id === selectedServices[index - 1]);
        if (previousService && previousService.duration) {
          appointmentTime.setMinutes(appointmentTime.getMinutes() + previousService.duration); // Dodajte trajanje prethodne usluge
        }
      }

      // Proverite da li je termin već zauzet
      const timeString = appointmentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      if (zauzetiTermini.includes(timeString)) {
        alert(`Termin za uslugu ${service.name} je već zauzet. Molimo izaberite drugi termin.`);
        return;
      }

      const appointmentData = {
        email,
        ime: name,
        datum: appointmentTime.toISOString(), // Konvertujte datum u ISO format
        vreme: appointmentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), // Koristite novo vreme
        usluga: service.name, // Uzimamo naziv usluge
        uslugaId: serviceId, // ID usluge
        telefon: phone,
      };

      console.log('Slanje podataka za termin:', appointmentData);
      const response = await fetch(API_ENDPOINTS.TERMINI, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(appointmentData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Greška prilikom zakazivanja termina');
      }

      return await response.json(); // Vratite rezultat
    });

    // Sačekajte da se svi zahtevi završe
    const results = await Promise.all(appointmentPromises);
    console.log('Svi termini zakazani:', results);

    // Očistite formu ili postavite poruku o uspehu
    setSuccessMessage('Termini su uspešno zakazani!');
    // Očistite stanje forme
    
    setDate(new Date());
    setTime(new Date());
    
    
    setSelectedServices([]);
  } catch (error) {
    console.error('Greška prilikom zakazivanja termina:', error);
  }
};


  // Očistite localStorage nakon što se informacija pročita
  useEffect(() => {
    const noviTermin = localStorage.getItem('noviTermin');
    if (noviTermin) {
      // Emitujte događaj ili osvežite termine
      localStorage.removeItem('noviTermin');
      // Ovdje možete dodati logiku za osvežavanje termina ako je potrebno
    }
  }, []);

  const images = [...Array(6)].map((_, index) => ({
    before: require(`./slike-tanja-salon/${index + 1}.png`),
    after: require(`./slike-tanja-salon/${(index + 1) * 11}.png`),
  }));

  const handleImageClick = (index) => {
    setCurrentImageIndex(index); // Postavljamo trenutni indeks na izabranu sliku
  };
  useEffect(() => {
    const fetchServices = async () => {
      const token = localStorage.getItem('token');
      const response = await fetch(API_ENDPOINTS.SERVICES, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await response.json();
      setServices(data); // Proverite da li se podaci pravilno postavljaju
    };
  
    fetchServices();
  }, []);

  // Filtrirajte usluge prema odabranom polu
  useEffect(() => {
    const filteredServices = services.filter(service => service.gender === gender);
    setSelectedServices(filteredServices);
  }, [gender, services]);
  


  return (
    <form onSubmit={handleSubmit} className="space-y-6 ">
  <div>
    <label htmlFor="name" className="block text-sm font-medium text-gray-700">Ime</label>
    <input
      type="text"
      id="name"
      value={name}
      onChange={(e) => setName(e.target.value)}
      required
      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
    />
  </div>
  
  <div>
    <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
    <input
      type="email"
      id="email"
      value={email}
      onChange={(e) => setEmail(e.target.value)}
      required
      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
    />
  </div>
  
  <div>
    <label htmlFor="date" className="block text-sm font-medium text-gray-700">Datum</label>
    <DatePicker
      id="date"
      selected={date}
      onChange={handleDateChange}
      required
      filterDate={date => isWorkingDay(date)}
      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
    />
  </div>
  
  <div>
    <label htmlFor="time" className="block text-sm font-medium text-gray-700">Vreme</label>
    <DatePicker
      id="time"
      selected={time}
      onChange={(date) => {
        if (date) {
          setTime(date);
        }
      }} 
      showTimeSelect
      showTimeSelectOnly
      timeIntervals={15}
      dateFormat="HH:mm" // Koristite HH:mm za 24-časovni format
      timeFormat="HH:mm" // Koristite HH:mm za 24-časovni format
      filterTime={filterTime}
      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
    />
  </div>
  
  <div className="mb-4">
    <label className="block text-sm font-medium text-gray-700">Izaberite pol</label>
    <select
      value={gender}
      onChange={(e) => {
        const newGender = e.target.value;
        setGender(newGender);
        
        // Filtrirajte usluge prema novom polu
        const filteredServices = services.filter(service => service.gender === newGender);
        setSelectedServices(filteredServices.map(service => service._id)); // Postavite ID-ove filtriranih usluga
      }}
      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
    >
      <option value="Muškarac">Muškarac</option>
      <option value="Žena">Žena</option>
    </select>
  </div>
  
  <div>
    <label className="block text-sm font-medium text-gray-700">Usluge</label>
    <div className="grid grid-cols-2 gap-2">
      {services.filter(service => service.gender === gender).map((service) => ( // Filtriramo usluge prema polu
        <div key={service._id} className="flex items-center">
          <input
            type="checkbox"
            id={service._id}
            checked={selectedServices.includes(service._id)} // Proverite da li je usluga izabrana
            onChange={() => handleServiceChange(service._id)} // Prosledite ID usluge
            className="mr-2"
          />
          <label htmlFor={service._id} className="text-sm text-gray-700">
            {service.name}
          </label>
        </div>
      ))}
    </div>
  </div>
  
  <div>
    <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Telefon</label>
    <input
      type="tel"
      id="phone"
      value={phone}
      onChange={(e) => setPhone(e.target.value)}
      required
      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
    />
  </div>
  
  <button
    type="submit"
    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
  >
    Zakazivanje
  </button>
  
  {successMessage && (
    <div className="bg-green-500 text-white p-4 rounded-md text-center">
      {successMessage}
    </div>
  )}
</form>
  );
};

