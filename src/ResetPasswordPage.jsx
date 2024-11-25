import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom'; // Uvezite useNavigate
import API_ENDPOINTS from './apiConfig';

export default function ResetPasswordPage() {
  const { token } = useParams(); // Uzimamo token iz URL-a
  const [newPassword, setNewPassword] = useState(''); // Stanje za novu lozinku
  const navigate = useNavigate(); // Inicijalizujte useNavigate

  const handleResetPassword = async (e) => {
    e.preventDefault(); // Sprečava osvežavanje stranice
    try {
      const response = await fetch(`${API_ENDPOINTS.CHANGE_PASSWORD}/${token}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ newPassword }), // Slanje nove lozinke
      });

      if (!response.ok) {
        throw new Error('Greška pri promeni lozinke.');
      }

      alert('Lozinka uspešno promenjena!'); // Obaveštenje o uspehu
      navigate('/login'); // Preusmerite na stranicu za prijavu
    } catch (error) {
      alert(error.message); // Prikaz greške
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <form onSubmit={handleResetPassword} className="bg-white p-6 rounded shadow-md">
        <h2 className="text-2xl mb-4">Promenite lozinku</h2>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Nova lozinka</label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)} // Ažuriranje nove lozinke
            required
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
          />
        </div>
        <button
          type="submit"
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Promenite lozinku
        </button>
      </form>
    </div>
  );
}