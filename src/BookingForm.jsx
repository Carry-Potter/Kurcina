import React, { useState, useEffect } from 'react';

const BookingForm = ({ services: availableServices, selectedServices: initialSelectedServices, fetchZauzetiTermini }) => {
  const [gender, setGender] = useState('Muškarac'); // Dodajte stanje za pol
  const [services, setServices] = useState([]); // Stanje za usluge
  const [selectedServices, setSelectedServices] = useState([]);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [service, setService] = useState('');
  const [zauzetiTermini, setZauzetiTermini] = useState([]);
  const [phone, setPhone] = useState('');

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
      setServices(data);
    };

    fetchServices();
  }, []);

  useEffect(() => {
    if (date) {
      fetchZauzetiTermini(date).then(setZauzetiTermini);
    }
  }, [date, fetchZauzetiTermini]);

  // Filtrirajte usluge prema odabranom polu
  useEffect(() => {
    const filteredServices = services.filter(service => service.gender === gender);
    setSelectedServices(filteredServices);
  }, [gender, services]);

  const fetchZauzetiTermini = async (datum) => {
    const token = localStorage.getItem('token'); // Uzimanje tokena iz localStorage
    try {
      const response = await fetch(`${API_ENDPOINTS.ZAUZETI_TERMINI}?datum=${datum}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`, // Slanje tokena u Authorization hederu
        },
      });

      if (!response.ok) {
        throw new Error('Greška pri dobijanju zauzetih termina');
      }

      const data = await response.json();
      setZauzetiTermini(data.map(termin => termin.time)); // Pretpostavljamo da `data` sadrži objekte sa `time` svojstvom
    } catch (error) {
      console.error('Greška:', error);
    }
  };

  const isTimeSlotAvailable = (timeSlot) => {
    return !zauzetiTermini.includes(Number(timeSlot)); // Konvertujte timeSlot u broj
  };

  const handleServiceChange = (selectedService) => {
    setService(selectedService); // Uverite se da se postavlja ceo objekat usluge
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('handleSubmit funkcija je pozvana');

    // Proverite da li su svi potrebni podaci uneti
    if (!name || !email || !date || !time || !service || !phone) {
      alert('Molimo popunite sve podatke.');
      return;
    }

    if (zauzetiTermini.includes(time)) {
      alert('Izabrani termin je već zauzet. Molimo izaberite drugi termin.');
      return;
    }

    try {
      const appointmentData = {
        email, // Korisnički email
        ime: name, // Ime korisnika
        datum: date, // Datum zakazivanja
        vreme: time, // Vreme zakazivanja
        usluga: service.name,
        uslugaId: service._id, // Izabrana usluga (ID usluge)
        telefon: phone, // Broj telefona
      };
      console.log('appointmentData:', appointmentData);

      const response = await fetch(API_ENDPOINTS.TERMINI, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`, // Dodajte token ako je potreban
        },
        body: JSON.stringify(appointmentData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Greška prilikom zakazivanja termina');
      }

      const result = await response.json();
      console.log('Termin zakazan:', result);
    } catch (error) {
      console.error('Greška prilikom zakazivanja termina:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
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
        <input
          type="date"
          id="date"
          value={date}
          onChange={(e) => {
            setDate(e.target.value);
            fetchZauzetiTermini(e.target.value); // Učitajte zauzete termine za izabrani datum
          }}
          required
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
        />
      </div>
      <div>
        <label htmlFor="time" className="block text-sm font-medium text-gray-700">Vreme</label>
        <select
          id="time"
          value={time}
          onChange={(e) => setTime(e.target.value)}
          required
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
        >
          {[...Array(24)].map((_, index) => {
            const timeValue = String(index).padStart(2, '0');
            return (
              <option key={index} value={timeValue} disabled={!isTimeSlotAvailable(timeValue)}>
                {timeValue} : 00
              </option>
            );
          })}
        </select>
      </div>
      {/* Odabir pola */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700">Izaberite pol</label>
        <select
          value={gender}
          onChange={(e) => setGender(e.target.value)}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
        >
          <option value="Muškarac">Muškarac</option>
          <option value="Žena">Žena</option>
        </select>
      </div>
      <div>
        <label htmlFor="service" className="block text-sm font-medium text-gray-700">Usluga</label>
        <select
          id="service"
          value={service._id || ''} // Ovdje će biti ID usluge
          onChange={(e) => {
            const selectedService = initialSelectedServices.find(s => s._id === e.target.value);
            handleServiceChange(selectedService); // Ovdje se postavlja ceo objekat usluge
          }}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
          required
        >
          <option value="">Izaberite uslugu</option>
          {initialSelectedServices.map((service) => (
            <option key={service._id} value={service._id}> {/* Postavljamo ID usluge kao value */}
              {service.name} - Trajanje: {service.duration} min, Cena: {service.price} RSD
            </option>
          ))}
        </select>
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
    </form>
  );
};

export default BookingForm;