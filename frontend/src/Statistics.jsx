import React, { useState, useEffect } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import API_ENDPOINTS from './apiConfig';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const Statistics = () => {
  const [popularServices, setPopularServices] = useState([]);
  const [monthlyEarnings, setMonthlyEarnings] = useState([]);

  useEffect(() => {
    const fetchPopularServices = async () => {
      const token = localStorage.getItem('token');
      const response = await fetch(API_ENDPOINTS.NAJ_POPULARNIJE_USLUGE, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await response.json();
      setPopularServices(data);
    };

    const fetchMonthlyEarnings = async () => {
      const token = localStorage.getItem('token');
      const response = await fetch(API_ENDPOINTS.UKUPNA_ZARADA, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setMonthlyEarnings(data);
      } else {
        console.error('Greška prilikom dobijanja podataka o zaradi');
      }
    };

    fetchPopularServices();
    fetchMonthlyEarnings();
  }, []);

  // Priprema podataka za grafikon popularnih usluga
  const popularServicesChartData = {
    labels: popularServices.map(service => service._id), // Nazivi usluga
    datasets: [
      {
        label: 'Broj zakazanih',
        data: popularServices.map(service => service.count), // Broj zakazanih
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
      },
    ],
  };

  // Priprema podataka za grafikon ukupne zarade
  const earningsChartData = {
    labels: monthlyEarnings.map(item => `Mesec ${item.month}`), // Meseci
    datasets: [
      {
        label: 'Ukupna zarada',
        data: monthlyEarnings.map(item => item.totalEarnings), // Ukupna zarada
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Statistika usluga',
      },
    },
  };

  const earningsOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Ukupna zarada po mesecima',
      },
    },
  };

  return (
    <div className="mt-4">   {monthlyEarnings.length > 0 && (
        <div className="mt-4 mb-4">
          <h3 className="text-lg font-semibold">Ukupna zarada po mesecima:</h3>
          <Bar data={earningsChartData} options={earningsOptions} />
          <div className="mt-4">
            <ul>
              {monthlyEarnings.map(item => (
                <li key={item.month}>Mesec {item.month} - {item.totalEarnings} RSD</li>
              ))}
            </ul>
          </div>
        </div>
      )}
      {popularServices.length > 0 && (
        <div className="mt-4 mb-4">
          <h3 className="text-lg font-semibold">Najpopularnije usluge:</h3>
          <Bar data={popularServicesChartData} options={options} />
          <div className="mt-4">
            <ul>
              {popularServices.map(service => (
                <li key={service._id}>{service._id} - {service.count} zakazanih</li>
              ))}
            </ul>
          </div>
        </div>
      )}

   
    </div>
  );
};

export default Statistics;