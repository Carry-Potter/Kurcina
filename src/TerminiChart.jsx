// zakazivanje/src/TerminiChart.jsx
import React, { useEffect, useState, useRef } from 'react';
import { Pie } from 'react-chartjs-2';
import { Chart, ArcElement, Tooltip, Legend } from 'chart.js';

// Registrujte potrebne elemente
Chart.register(ArcElement, Tooltip, Legend);

const TerminiChart = ({ data }) => {
  const [chartData, setChartData] = useState(null);
  const chartRef = useRef(null); // Koristimo useRef za referencu na canvas

  useEffect(() => {
    if (data && data.length > 0) {
      const formattedData = {
        labels: data.map(item => item.month),
        datasets: [
          {
            label: 'Broj zakazanih termina',
            data: data.map(item => item.count),
            backgroundColor: [
              'rgba(255, 99, 132, 0.6)',
              'rgba(54, 162, 235, 0.6)',
              'rgba(255, 206, 86, 0.6)',
              'rgba(75, 192, 192, 0.6)',
              'rgba(153, 102, 255, 0.6)',
              'rgba(255, 159, 64, 0.6)',
              'rgba(255, 99, 132, 0.6)',
            ],
          },
        ],
      };
      setChartData(formattedData);
    }
  }, [data]);

  // Očistite chart kada se komponenta unmountuje
  useEffect(() => {
    const chartInstance = chartRef.current;
    return () => {
      if (chartInstance) {
        chartInstance.destroy();
      }
    };
  }, []);

  if (!chartData) {
    return <div>Loading...</div>; // Indikator učitavanja
  }

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">Zakazani termini po mesecima</h2>
      <Pie ref={chartRef} data={chartData} />
    </div>
  );
};

export default TerminiChart;