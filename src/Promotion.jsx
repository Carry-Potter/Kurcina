// zakazivanje/src/Promotion.jsx
import React, { useEffect, useState } from 'react';
import API_ENDPOINTS from './apiConfig';

const Promotion = () => {
  const [promotions, setPromotions] = useState([]);

  useEffect(() => {
    const fetchPromotions = async () => {
      const response = await fetch(API_ENDPOINTS.PROMOTION);
      const data = await response.json();
      setPromotions(data);
    };

    fetchPromotions();
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Aktivne promocije</h2>
      {promotions.map((promotion) => (
        <div key={promotion._id} className="mb-4 p-4 bg-gray-100 rounded-lg shadow">
          <h3 className="text-xl font-semibold text-gray-700">{promotion.service}</h3>
          <p className="text-gray-600">Traje od {new Date(promotion.startDate).toLocaleDateString()} do {new Date(promotion.endDate).toLocaleDateString()}</p>
          <p className="text-gray-600">Zakazani termini: {promotion.requiredAppointments}, Gratis: {promotion.freeAppointments}</p>
        </div>
      ))}
    </div>
  );
};

export default Promotion;