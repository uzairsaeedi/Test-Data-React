import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import axios from 'axios';
import './BarChartComponent.css'; 

const BarChartComponent = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('https://django-dev.aakscience.com/candidate_test/fronted');
        console.log('API Data:', response.data); 
        const processedData = processData(response.data);
        console.log('Processed Data:', processedData); 
        setData(processedData);
      } catch (err) {
        setError('Error fetching data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const processData = (rawData) => {
    if (!Array.isArray(rawData) || rawData.length === 0) {
      console.error('Expected an array of objects but got:', rawData);
      return [];
    }

    return rawData.flatMap(entry => {
      const [year, months] = Object.entries(entry)[0];

      if (!Array.isArray(months)) {
        console.error('Expected an array for months but got:', months);
        return [];
      }

      return months.flatMap(month => {
        const [monthKey, days] = Object.entries(month)[0];

        if (!Array.isArray(days)) {
          console.error('Expected an array for days but got:', days);
          return [];
        }

        return days.map(day => {
          const [dateKey, value] = Object.entries(day)[0];

          try {
            const date = new Date(dateKey.split(' ,')[0]);
            if (isNaN(date)) {
              console.error('Invalid date:', dateKey);
              return { date: 'Invalid Date', value: value };
            }
            return {
              date: date.toISOString().split('T')[0],
              value: value
            };
          } catch (e) {
            console.error('Error processing item:', day, e);
            return { date: 'Error', value: value };
          }
        });
      });
    });
  };

  if (loading) return <p className="no-data">Loading...</p>;
  if (error) return <p className="no-data">{error}</p>;

  console.log('Data for Chart:', data);

  return (
    <div className="chart-container">
      <h2 className="chart-title">Candidate Test Data</h2>
      <p className="chart-description">This chart displays the candidate test data trends. Hover over the bars to see detailed values.</p>
      {data.length > 0 ? (
        <BarChart width={700} height={400} data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="value" fill="#8884d8" />
        </BarChart>
      ) : (
        <p className="no-data">No data available</p>
      )}
    </div>
  );
};

export default BarChartComponent;
