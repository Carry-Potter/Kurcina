import React, { useState, useEffect } from 'react';
import TerminiChart from './TerminiChart';
import Statistics from './Statistics';
import Promotion from './Promotion';
import PromotionUsers from './AdminPromotionUsers';
import AllUsers from './AllUsers';
import API_ENDPOINTS from './apiConfig';
const daysOfWeek = [
  'Ponedeljak', 'Utorak', 'Sreda', 'Četvrtak', 'Petak', 'Subota', 'Nedelja'
];

const AdminPage = ({ user }) => {
  
  const [hoursInput, setHoursInput] = useState({});
  const [workingHours, setWorkingHours] = useState([]);
  
  const [terminiData, setTerminiData] = useState([]);

  useEffect(() => {
    const fetchWorkingHours = async () => {
      const token = localStorage.getItem('token');
      const response = await fetch(API_ENDPOINTS.WORKING_HOURS, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (Array.isArray(data)) {
        setWorkingHours(data);
      } else {
        setWorkingHours([]); // Postavite na prazan niz ako nije niz
      }
    };

    fetchWorkingHours();
  }, []);

  const handleUpdateHours = async (day) => {
    const { open, close, isClosed } = hoursInput[day];
    const token = localStorage.getItem('token');

    const updatedOpen = isClosed ? null : open;
    const updatedClose = isClosed ? null : close;

    const response = await fetch(API_ENDPOINTS.WORKING_HOURS, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify([{ day, open: updatedOpen, close: updatedClose, isClosed }]),
    });

    const updatedHours = await response.json();
    setWorkingHours(updatedHours);
  };

 

  const handleChange = (day, field, value) => {
    setHoursInput((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        [field]: value,
      },
    }));
  };

  // Funkcija za formatiranje vremena u 24h
  const formatTime = (time) => {
    if (!time) return '';
    const [hours, minutes] = time.split(':');
    return `${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}`;
  };
  const [services, setServices] = useState([]);
  const [newService, setNewService] = useState({ name: '', gender: 'Muškarac', duration: '', price: '' });
  const [editingService, setEditingService] = useState(null);

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

  const handleServiceChange = (e) => {
    const { name, value } = e.target;
    setNewService((prev) => ({ ...prev, [name]: value }));
  };
 

  const handleAddOrUpdateService = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token'); // Uverite se da je token postavljen

    const url = editingService ? `${API_ENDPOINTS.SERVICES}/${editingService}` : API_ENDPOINTS.SERVICES; // Proverite URL

    console.log('URL za PUT zahtev:', url); // Dodajte log za proveru
    console.log('Identifikator usluge:', editingService); // Dodajte log za proveru

    if (editingService) {
        // Ažuriranje usluge
        await fetch(url, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`, // Uverite se da je token ovde
            },
            body: JSON.stringify(newService),
        });
        setEditingService(null);
    } else {
        // Kreiranje nove usluge
        await fetch(API_ENDPOINTS.SERVICES, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`, // Uverite se da je token ovde
            },
            body: JSON.stringify(newService),
        });
    }

    setNewService({ name: '', gender: 'Muškarac', duration: '', price: '' });
    // Ponovo učitajte usluge
    const response = await fetch(API_ENDPOINTS.SERVICES, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
        },
    });
    const data = await response.json();
    setServices(data);
};

  const handleEditService = (service) => {
    setNewService(service);
    setEditingService(service._id);
  };

  const handleDeleteService = async (id) => {
    const token = localStorage.getItem('token');
    await fetch(`${API_ENDPOINTS.Service}/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    setServices((prev) => prev.filter((service) => service._id !== id));
  };
  const [searchTerm, setSearchTerm] = useState('');

  const filteredServices = services.filter(service =>
    service.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  

  useEffect(() => {
    const fetchTerminiData = async () => {
      const token = localStorage.getItem('token');
      const response = await fetch(API_ENDPOINTS.ZAKAZANI_TERMINI_PO_MESECIMA, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await response.json();
      setTerminiData(data);
    };

    fetchTerminiData();
  }, []);
const maxTermini = Math.max(...terminiData.map(item => item.count));
  const monthWithMaxTermini = terminiData.find(item => item.count === maxTermini);


  const [service, setService] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [requiredAppointments, setRequiredAppointments] = useState(0);
  const [freeAppointments, setFreeAppointments] = useState(0);

  const handleCreatePromotion = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');

    try {
      const response = await fetch(API_ENDPOINTS.PROMOTION, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ service, startDate, endDate, requiredAppointments, freeAppointments }),
      });

      if (!response.ok) {
        throw new Error('Greška pri kreiranju promocije');
      }

      // Resetovanje forme
      setService('');
      setStartDate('');
      setEndDate('');
      setRequiredAppointments(0);
      setFreeAppointments(0);
      alert('Promocija je uspešno kreirana!');
    } catch (error) {
      alert(error.message);
    }
  };
  
  return (
    <div className="max-w-4xl mx-auto p-8 bg-gray-100 rounded-md shadow-md">
      <h1 className="text-3xl font-bold text-gray-800 mb-4">Admin Stranica</h1>
      <div className="flex justify-between">
        <div className="w-1/3">
          <TerminiChart data={terminiData} />
        </div>
        <div className="w-1/2">
          <Statistics />
        </div>
      </div>
    {monthWithMaxTermini && (
      <div className="mt-4">
        <h3 className="text-lg font-semibold">Mesec sa najviše zakazanih termina: {monthWithMaxTermini.month}</h3>
        <p>Broj zakazanih termina trenutno: {monthWithMaxTermini.count}</p>
      </div>
    )}
      <h2 className="text-2xl font-semibold text-gray-700 mb-4">Radno vreme</h2>
      <table className="w-full text-left">
        <thead>
          <tr className="bg-gray-200">
            <th className="px-4 py-2">Dan</th>
            <th className="px-4 py-2">Otvoreno</th>
            <th className="px-4 py-2">Zatvoreno</th>
            <th className="px-4 py-2">Neradni dan</th>
            <th className="px-4 py-2">Akcije</th>
          </tr>
        </thead>
        <tbody>
          {daysOfWeek.map((day) => (
            <tr key={day} className="border-b border-gray-200">
              <td className="px-4 py-2">{day}</td>
              <td className="px-4 py-2">
                <input
                  type="time"
                  value={formatTime(hoursInput[day]?.open) || ''}
                  onChange={(e) => handleChange(day, 'open', e.target.value)}
                  disabled={hoursInput[day]?.isClosed}
                  className="border border-gray-300 rounded-md p-2"
                />
              </td>
              <td className="px-4 py-2">
                <input
                  type="time"
                  value={formatTime(hoursInput[day]?.close) || ''}
                  onChange={(e) => handleChange(day, 'close', e.target.value)}
                  disabled={hoursInput[day]?.isClosed}
                  className="border border-gray-300 rounded-md p-2"
                />
              </td>
              <td className="px-4 py-2">
                <input
                  type="checkbox"
                  checked={hoursInput[day]?.isClosed || false}
                  onChange={(e) => handleChange(day, 'isClosed', e.target.checked)}
                  className="form-checkbox"
                />
              </td>
              <td className="px-4 py-2">
                <button onClick={() => handleUpdateHours(day)} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                  Ažuriraj
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

    

      <div className="mt-8 flex justify-center">
        {Array.isArray(workingHours) && workingHours.map((hours) => (
          <div key={hours.day} className="text-gray-700 mb-2 mx-4">
            <span className="font-bold">{hours.day}:</span>
            <div>{ `${formatTime(hours.open) || 'Neradni dan'} - ${formatTime(hours.close) || 'Neradni dan'}`}</div>
          </div>
        ))}
      </div>

      <h2 className="text-2xl font-semibold text-gray-700 mb-4">Usluge</h2>
      <form onSubmit={handleAddOrUpdateService} className="mb-4">
        <input
          type="text"
          name="name"
          value={newService.name}
          onChange={handleServiceChange}
          placeholder="Naziv usluge"
          required
          className="border border-gray-300 rounded-md p-2 mr-2"
        />
        <select
          name="gender"
          value={newService.gender}
          onChange={handleServiceChange}
          className="border border-gray-300 rounded-md p-2 mr-2"
        >
          <option value="Muškarac">Muškarac</option>
          <option value="Žena">Žena</option>
        </select>
        <input
          type="number"
          name="duration"
          value={newService.duration}
          onChange={handleServiceChange}
          placeholder="Trajanje (min)"
          required
          className="border border-gray-300 rounded-md p-2 mr-2"
        />
        <input
          type="number"
          name="price"
          value={newService.price}
          onChange={handleServiceChange}
          placeholder="Cena"
          required
          className="border border-gray-300 rounded-md p-2 mr-2"
        />
        <button type="submit" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mb-4">
          {editingService ? 'Ažuriraj uslugu' : 'Dodaj uslugu'}
        </button>
       
      </form>
       <input
  type="text"
  placeholder="Pretraži usluge..."
  value={searchTerm}
  onChange={(e) => setSearchTerm(e.target.value)}
  className="border border-gray-300 rounded-md p-2"
/>

      <table className="w-full text-left">
        <thead>
          <tr className="bg-gray-200">
            <th className="px-4 py-2">Naziv</th>
            <th className="px-4 py-2">Pol</th>
            <th className="px-4 py-2">Trajanje (min)</th>
            <th className="px-4 py-2">Cena</th>
            <th className="px-4 py-2">Akcije</th>
          </tr>
        </thead>
        <tbody>
          {services.map((service) => (
            <tr key={service._id} className="border-b border-gray-200">
              <td className="px-4 py-2">{service.name}</td>
              <td className="px-4 py-2">{service.gender}</td>
              <td className="px-4 py-2">{service.duration}</td>
              <td className="px-4 py-2">{service.price}</td>
              <td className="px-4 py-2">
                <button onClick={() => handleEditService(service)} className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-1 px-2 rounded">
                  Izmeni
                </button>
                <button onClick={() => handleDeleteService(service._id)} className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded ml-2">
                  Obriši
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div>
      <div className="max-w-4xl mx-auto p-8 bg-gray-100 rounded-md shadow-md">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Kreiraj promociju</h1>
        <form onSubmit={handleCreatePromotion} className="space-y-4">
          <div className="flex flex-col">
            <label htmlFor="service" className="text-sm font-medium text-gray-700">Usluga</label>
            <input id="service" type="text" value={service} onChange={(e) => setService(e.target.value)} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm" />
          </div>
          <div className="flex flex-col">
            <label htmlFor="startDate" className="text-sm font-medium text-gray-700">Datum početka</label>
            <input id="startDate" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm" />
          </div>
          <div className="flex flex-col">
            <label htmlFor="endDate" className="text-sm font-medium text-gray-700">Datum završetka</label>
            <input id="endDate" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm" />
          </div>
          <div className="flex flex-col">
            <label htmlFor="requiredAppointments" className="text-sm font-medium text-gray-700">Broj zakazanih termina za gratis</label>
            <input id="requiredAppointments" type="number" value={requiredAppointments} onChange={(e) => setRequiredAppointments(e.target.value)} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm" />
          </div>
          <div className="flex flex-col">
            <label htmlFor="freeAppointments" className="text-sm font-medium text-gray-700">Broj gratis termina</label>
            <input id="freeAppointments" type="number" value={freeAppointments} onChange={(e) => setFreeAppointments(e.target.value)} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm" />
          </div>
          <button type="submit" className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">Kreiraj promociju</button>
        </form>
      </div>
      <Promotion />
      <PromotionUsers />
      <AllUsers />
      </div></div>
  );
};

export default AdminPage;