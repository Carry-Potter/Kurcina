// zakazivanje/src/TotalEarnings.jsx
import React, { useState, useEffect } from 'react';
import API_ENDPOINTS from './apiConfig';
const TotalEarnings = () => {
  const [totalEarnings, setTotalEarnings] = useState(0);

  useEffect(() => {
    const fetchTotalEarnings = async () => {
      const token = localStorage.getItem('token');
      const response = await fetch(API_ENDPOINTS.UKUPNA_ZARADA, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await response.json();
      setTotalEarnings(data.totalEarnings);
    };

    fetchTotalEarnings();
  }, []);

  return (
    <div className="mt-4">
      <h3 className="text-lg font-semibold">Ukupna zarada od zakazanih termina: {totalEarnings} RSD</h3>
    </div>
  );
};

export default TotalEarnings;