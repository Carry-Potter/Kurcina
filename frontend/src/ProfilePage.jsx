// zakazivanje/src/ProfilePage.jsx
import React, { useEffect, useState } from 'react';
import API_ENDPOINTS from './apiConfig';
export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [termini, setTermini] = useState([]);
  const [promotions, setPromotions] = useState([]);

  useEffect(() => {
    const loggedUser = JSON.parse(localStorage.getItem('user'));
    if (loggedUser) {
      setUser(loggedUser);
      setFirstName(loggedUser.firstName);
      setLastName(loggedUser.lastName);
      setEmail(loggedUser.email);
      setPhone(loggedUser.phone);
    }

    // Fetch termina od danas
    const fetchTermini = async () => {
      const token = localStorage.getItem('token');
      const response = await fetch(API_ENDPOINTS.ZAKAZANI_TERMINI_OD_DANAS, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await response.json();
      const updatedData = data.map(termin => ({
        ...termin,
        datum: new Date(termin.datum),
       
      }));
      setTermini(updatedData);
      console.log(updatedData);
    };

    const fetchPromotions = async () => {
      const response = await fetch(API_ENDPOINTS.PROMOTION)
      const data = await response.json();
      setPromotions(data);
    };

    fetchTermini();
    fetchPromotions();
  }, []);

  const getPromotionDetails = (service) => {
    const promotion = promotions.find(p => p.service === service);
    return promotion ? {
      required: promotion.requiredAppointments,
      free: promotion.freeAppointments,
    } : null;
  };

    const handleUpdate = async (e) => {
    e.preventDefault();
    
    // Validacija podataka
    if (!firstName || !lastName || !email || !phone) {
      setMessage('Sva polja su obavezna!');
      return;
    }

    const token = localStorage.getItem('token');

    try {
      const response = await fetch(API_ENDPOINTS.UPDATE_USER, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ firstName, lastName, email, phone }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Greška pri ažuriranju podataka');
      }

      const updatedUser = await response.json();
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setMessage('Podaci su uspešno ažurirani!');
    } catch (error) {
      setMessage(error.message);
    }
  };

  const handleCancelTermin = async (id) => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`${API_ENDPOINTS.TERMINI}/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Greška pri otkazivanju termina');
      }

      // Uklonite otkazani termin iz stanja
      setTermini(termini.filter(termin => termin._id !== id));
      setMessage('Termin je uspešno otkazan!');
    } catch (error) {
      setMessage(error.message);
    }
  };

  if (!user) {
    return <div>Morate biti ulogovani da biste videli svoj profil.</div>;
  }

  // Prikazivanje termina koji učestvuju u promociji
  const promotionCounts = {};

  termini.forEach(termin => {
    const promotionDetails = getPromotionDetails(termin.usluga);
    if (promotionDetails) {
      const key = termin.usluga; // Koristimo samo uslugu kao ključ

      if (!promotionCounts[key]) {
        promotionCounts[key] = {
          totalBooked: 0,
          requiredAppointments: promotionDetails.required,
          freeAppointments: promotionDetails.free,
          terminList: [], // Dodato: lista termina
        };
      }
      promotionCounts[key].totalBooked++;
      promotionCounts[key].terminList.push(termin); // Dodato: dodavanje termina u listu
    }
  });

  // Prikazivanje termina sa resetovanjem broja zakazanih termina
  const displayedPromotions = [];
  Object.entries(promotionCounts).forEach(([usluga, details]) => {
    const total = details.totalBooked;
    const required = details.requiredAppointments;

    // Dodato: proverava da li je termin besplatan
    const isFree = total % 4 === 0 && total > 0; // Svaka četvrta usluga je besplatna

    displayedPromotions.push({ usluga, total, required, isFree, terminList: details.terminList });
  });

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-4xl w-full">
        <h2 className="text-3xl mb-6">Profil korisnika</h2>
        <form onSubmit={handleUpdate}>
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700">Ime</label>
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
            />
          </div>
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700">Prezime</label>
            <input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
            />
          </div>
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
            />
          </div>
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700">Broj telefona</label>
            <input
              type="text"
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
            Ažuriraj podatke
          </button>
        </form>
        {message && <p className="mt-6 text-green-600">{message}</p>}

        {/* Prikazivanje termina koje je korisnik zakazao od danas */}
        <h3 className="text-xl font-semibold mt-8">Zakazani termini </h3>
        {termini.length > 0 ? (
          <ul className="mt-2">
            {termini.map((termin) => (
              <li key={termin._id} className="border-b py-2 flex justify-between items-center">
                {new Date(termin.datum).toLocaleDateString()} - {termin.vreme}:00 - {termin.usluga}
                <button
                  onClick={() => handleCancelTermin(termin._id)}
                  className="ml-4 text-red-600 hover:text-red-800"
                >
                  Otkazi
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-2">Nema zakazanih termina od danas.</p>
        )}

        {/* Prikazivanje termina koji učestvuju u promociji */}
        {displayedPromotions.map(({ usluga, total, required, isFree, terminList }) => (
          <div key={usluga} className="border p-4 mb-4 rounded shadow-md bg-white">
            <h3 className="text-xl font-semibold">{usluga}</h3>
            {terminList.map((termin) => (
              <div key={termin._id}>
                <p className="text-gray-600">{new Date(termin.datum).toLocaleDateString()} - Vreme: {termin.vreme}</p>
              </div>
            ))}
            <p className={`text-green-600 ${isFree ? 'font-bold' : ''}`}>
              Zakazano: {total} / {required} {isFree ? 'besplatno!' : ''}
            </p>
          </div>
        ))}
 
      </div>
    </div>
  );
}
