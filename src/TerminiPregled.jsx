import React, { useEffect, useState, useContext } from 'react'; // Uvezite useContext
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import API_ENDPOINTS from './apiConfig';
import { TerminiContext } from './TerminiContext'; // Uvezite TerminiContext
import DatePicker from 'react-datepicker';
const localizer = momentLocalizer(moment);

const TerminiPregled = () => {
  const { termini, setTermini } = useContext(TerminiContext); // Koristite useContext
  const [datum, setDatum] = useState(new Date()); // Postavite datum na današnji datum
  const [serviceId, setServiceId] = useState(''); // Samo jedan ID usluge
  const [date, setDate] = useState(new Date()); // Postavite datum na današnji datum
  const [services, setServices] = useState([]);
  const [zauzetiTermini, setZauzetiTermini] = useState([]); 
  const [time, setTime] = useState(new Date());
  
  
  const fetchTermini = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('Token nije pronađen. Korisnik možda nije ulogovan.');
      return;
    }

    // Izračunavanje početka i kraja nedelje
    const startOfWeek = moment(datum).startOf('week').format('YYYY-MM-DD');
    const endOfWeek = moment(datum).endOf('week').format('YYYY-MM-DD');

    try {
      const response = await fetch(`${API_ENDPOINTS.ZAKAZANI_TERMINI_OD_DANAS}?start=${startOfWeek}&end=${endOfWeek}`, {
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
    // Proverite da li je termin.vreme validan string
    

    // Konvertujte vreme iz 12-satnog formata u 24-satni
    const dateTime = moment(termin.vreme, 'hh:mm A'); // Koristite moment.js za konverziju
   

    const hours = dateTime.hours(); // Uzmite sate iz Date objekta
    const minutes = dateTime.minutes(); // Uzmite minute iz Date objekta

    return {
        title: `${termin.usluga} - ${termin.ime}`,
        start: new Date(new Date(termin.datum).setHours(hours, minutes)),
        end: new Date(new Date(termin.datum).setHours(hours, minutes) + termin.duration * 60 * 1000),
    };
}).filter(event => event !== null);

  useEffect(() => {
    fetchTermini(); // Učitajte termine kada se komponenta učita

    const interval = setInterval(() => {
      fetchTermini(); // Periodično učitavanje termina
    }, 30000); // Proveravajte svake 5 sekundi

    return () => clearInterval(interval); // Očistite interval kada se komponenta unmountuje
  }, [datum]);








  useEffect(() => {
    const fetchServices = async () => {
        try {
            const response = await fetch(API_ENDPOINTS.SERVICES); // Proverite da li je ovo ispravan endpoint
            if (!response.ok) {
                throw new Error('Greška prilikom učitavanja usluga');
            }
            const data = await response.json();
            setServices(data); // Postavite usluge
            console.log('Učitajte usluge:', data); // Logovanje učitanih usluga
        } catch (error) {
            console.error('Greška prilikom učitavanja usluga:', error);
        }
    };

    fetchServices();
}, []);

const handleSubmit = async (event) => {
  event.preventDefault(); // Sprečava podrazumevano ponašanje forme

  // Proverite da li je vreme izabrano
  if (!time) {
      console.error('Vreme nije izabrano.');
      alert('Molimo izaberite vreme.');
      return; // Prekinite izvršavanje ako vreme nije izabrano
  }

  // Logovanje usluga
  console.log('Učitajte usluge:', services);

  // Proverite da li je vreme u ispravnom formatu
  const timeString = time; // Koristimo string za vreme
  if (zauzetiTermini.includes(timeString)) {
      alert('Izabrani termin je već zauzet. Molimo izaberite drugi termin.');
      return; // Prekinite izvršavanje ako je termin zauzet
  }

  try {
      const service = services.find(s => s._id === serviceId);
      if (!service) {
          console.error('Usluga nije pronađena za ID:', serviceId);
          return; // Ako usluga ne postoji, preskočite
      }

      // Izračunajte vreme za termin
      const appointmentTime = new Date(date); // Inicijalizujte novi datum
      const [hours, minutes] = time.split(':'); // Razdvojite sate i minute
      appointmentTime.setHours(hours, minutes); // Postavite sate i minute

      

      const appointmentData = {
          email: "frizer@gmail.com", // Fiksna vrednost
          ime: "frizer", // Fiksna vrednost
          datum: appointmentTime.toISOString(), // Konvertujte datum u ISO format
          vreme: appointmentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), // Vreme termina
          usluga: service.name, // Uzimamo naziv usluge
          uslugaId: serviceId, // ID usluge
          telefon: "0641234567", // Fiksna vrednost
      };

      console.log('Podaci za zakazivanje:', appointmentData); // Logovanje podataka

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
          console.error('Greška prilikom zakazivanja:', errorData); // Logovanje greške
          throw new Error(errorData.message || 'Greška prilikom zakazivanja termina');
      }

      const result = await response.json(); // Vratite rezultat
      console.log('Rezultat zakazivanja:', result); // Logovanje rezultata

      // Ažurirajte stanje termina
      setTermini(prevTermini => [
          ...prevTermini,
          {
              ...result,
              start: appointmentTime,
              end: new Date(appointmentTime.getTime() + service.duration * 60 * 1000), // Dodajte trajanje usluge
          }
      ]);

      // Očistite stanje forme
      fetchTermini();
      setServiceId(''); // Resetovanje ID usluge
      setDate(new Date()); // Resetovanje datuma
      setTime(''); // Resetovanje vremena
  } catch (error) {
      console.error('Greška prilikom zakazivanja termina:', error);
  }
};

  return (
    <div className="container mx-auto p-6">
      <h2 className="text-3xl font-bold mb-4 text-center">Pregled termina</h2>
      <div style={{ height: '500px' }}>
       <Calendar
    localizer={localizer}
    events={events}
    startAccessor="start"
    endAccessor="end"
    style={{ height: 500 }}
    views={['week']}
    defaultView="week"
    step={60}
    timeslots={1}
/>
      </div>
      <h3 className="text-2xl font-bold mt-6 mb-4">Zakazivanje termina</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label htmlFor="service" className="block text-sm font-medium text-gray-700">Usluga</label>
                <select
                    id="service"
                    value={serviceId} // Održava trenutnu vrednost
                    onChange={(e) => setServiceId(e.target.value)}
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                >
                    <option value="">Izaberite uslugu</option>
                    {termini.map((termin, index) => (
                        <option key={`${termin.uslugaId}-${index}`} value={termin.uslugaId}>
                            {termin.usluga}
                        </option>
                    ))}
                </select>
            </div>
            <div>
                <label htmlFor="date" className="block text-sm font-medium text-gray-700">Datum</label>
                <DatePicker
                    selected={date}
                    onChange={(date) => {
                        if (date) {
                            setDate(date); // Uverite se da se ovde postavlja Date objekat
                        }
                    }}
                    dateFormat="yyyy/MM/dd"
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
                    <option value="">Izaberite vreme</option>
                    {/* Primer vremena, možete dodati više opcija */}
                    {Array.from({ length: 24 }, (_, hour) => (
                        Array.from({ length: 4 }, (_, quarter) => {
                            const minutes = quarter * 15;
                            const timeValue = `${String(hour).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
                            return (
                                <option key={timeValue} value={timeValue}>
                                    {timeValue}
                                </option>
                            );
                        })
                    )).flat()}
                </select>
            </div>
            <button
                type="submit"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
                Zakazivanje
            </button>
        </form>
    </div>
  );
};

export default TerminiPregled;