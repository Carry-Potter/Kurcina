import React, { useEffect, useState, useContext } from 'react'; // Uvezite useContext
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import API_ENDPOINTS from './apiConfig';
import { TerminiContext } from './TerminiContext'; // Uvezite TerminiContext

import notification from './notifikacija.mp3'
;
import BookingForm from './BookingForm';
const localizer = momentLocalizer(moment);

const TerminiPregled = () => {
  const { termini, setTermini } = useContext(TerminiContext); // Koristite useContext
  const [datum, setDatum] = useState(new Date()); // Postavite datum na današnji datum
 
  const [previousTermCount, setPreviousTermCount] = useState(0);
  const [isSoundEnabled, setIsSoundEnabled] = useState(false); // Da li je zvuk omogućen

  useEffect(() => {
    // Proverite da li se broj termina povećao
    if (termini.length > previousTermCount && isSoundEnabled) {
      playNotificationSound(); // Reprodukujte zvuk ako je korisnik omogućio zvuk
    }

    // Ažurirajte prethodni broj termina
    setPreviousTermCount(termini.length);
  }, [termini, previousTermCount, isSoundEnabled]);

  const playNotificationSound = () => {
    const audio = new Audio(notification); // Putanja do zvučnog fajla
    console.log('Reprodukujte zvuk:', audio);
    audio.play().catch((error) => {
      console.error('Greška prilikom reprodukcije zvuka:', error);
    });
  };

  const handleUserInteraction = () => {
    // Ova funkcija se poziva kada korisnik interaguje sa stranicom
    setIsSoundEnabled(true); // Omogućite zvuk
    playNotificationSound(); // Opcionalno, reprodukujte zvuk odmah
  };
  
  const fetchTermini = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('Token nije pronađen. Korisnik možda nije ulogovan.');
      return;
    }

    // Izračunavanje početka i kraja nedelje
    const startOfWeek = moment(datum).startOf('week').format('YYYY-MM-DD');
    const endOfWeek = moment().add(1, 'month').format('YYYY-MM-DD');

    try {
      const response = await fetch(`${API_ENDPOINTS.PREGLED_TERMINA}?start=${startOfWeek}&end=${endOfWeek}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(errorData || 'Greška pri dobijanju termina');
      }

      const data = await response.json(); // Pročitajte JSON odgovor
      console.log('Termini:', data); // Dodato logovanje

      // Uzimanje trajanja usluge za svaki termin
      const terminiSaTrajanjem = await Promise.all(data.map(async (termin) => {
        const serviceResponse = await fetch(`${API_ENDPOINTS.SERVICES}/${termin.uslugaId}`, { // Koristite uslugaId
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        const serviceData = await serviceResponse.json();
        return {
          ...termin,
          duration: serviceData.duration, // Dodajte trajanje usluge
          
        };
      }));

      setTermini(terminiSaTrajanjem); // Postavite dobijene termine u stanje
    } catch (error) {
      console.error('Greška:', error);
    }
  };

  const events = termini.map(termin => {
    const dateTime = moment(termin.vreme, 'hh:mm A'); // Konvertujte vreme iz 12-satnog formata u 24-satni
    const hours = dateTime.hours();
    const minutes = dateTime.minutes();

    return {
        title: `${termin.usluga} - ${termin.ime} (${termin.vreme})`, // Uključite više informacija
        start: new Date(new Date(termin.datum).setHours(hours, minutes)),
        end: new Date(new Date(termin.datum).setHours(hours, minutes) + termin.duration * 60 * 1000),
        allDay: false, // Postavite na false ako želite da se prikaže kao vremenski termin
        // Dodajte dodatne informacije ako je potrebno
        tooltip: `Usluga: ${termin.usluga}\nIme: ${termin.ime}\nVreme: ${termin.vreme}`, // Dodatne informacije
    };
}).filter(event => event !== null);


  useEffect(() => {
    fetchTermini(); // Učitajte termine kada se komponenta učita

    const interval = setInterval(() => {
      fetchTermini(); // Periodično učitavanje termina
    }, 30000); // Proveravajte svake 5 sekundi

    return () => clearInterval(interval); // Očistite interval kada se komponenta unmountuje
  }, [datum]);













  return (
    <div className="container mx-auto p-6">
      <button onClick={handleUserInteraction}>Omogući zvuk</button>
      <h2 className="text-3xl font-bold mb-4 text-center">Pregled termina</h2>
      
      <div style={{ height: '900px' }}> 
      <Calendar
    localizer={localizer}
    events={events}
    startAccessor="start"
    endAccessor="end"
    style={{ height: 700, width: 'auto' }} // Povećajte širinu kalendara
    views={['week']}
    defaultView="week"
    step={30} 
    timeslots={4} 
    eventPropGetter={(event) => ({
        style: {
            
            borderRadius: '5px', // Povećajte zaobljenost
            opacity: 0.8, // Povećajte prozirnost
            color: 'white', // Boja teksta
            display: 'block', // Prikazivanje kao blok
            height: '300px', // Povećajte visinu termina
            width: '300px', // Povećajte širinu termina
        },
    })}
/>
      </div>
      <h3 className="text-2xl font-bold mt-6 mb-4">Zakazivanje termina</h3>
      <BookingForm />
    </div>
  );
};

export default TerminiPregled;
