import React, { useState } from 'react';
import API_ENDPOINTS from './apiConfig';

export default function ResetPasswordRequestPage() {
  const [email, setEmail] = useState('');

  const handleRequestReset = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(API_ENDPOINTS.RESET_PASSWORD, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        throw new Error('Greška pri slanju zahteva za resetovanje lozinke.');
      }

      alert('Link za resetovanje lozinke je poslat na vaš email.');
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <form onSubmit={handleRequestReset} className="bg-white p-6 rounded shadow-md">
        <h2 className="text-2xl mb-4">Zaboravili ste lozinku?</h2>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
          />
        </div>
        <button
          type="submit"
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Pošaljite link za resetovanje
        </button>
      </form>
    </div>
  );
}