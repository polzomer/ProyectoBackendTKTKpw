import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getActiveUser } from '../utils/storage';
import { getLevelInfo } from '../utils/leveling';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import './StatsPage.css';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const mockData = {
  day: {
    labels: ['Hace 6h', 'Hace 5h', 'Hace 4h', 'Hace 3h', 'Hace 2h', 'Hace 1h', 'Ahora'],
    hours: [0.5, 1, 0, 1.5, 0.8, 1.2, 0],
  },
  week: {
    labels: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'],
    hours: [2, 3.5, 4, 2, 5, 6, 3],
  },
  month: {
    labels: ['Semana 1', 'Semana 2', 'Semana 3', 'Semana 4'],
    hours: [15, 20, 18, 25],
  },
};

export default function StatsPage() {
  const navigate = useNavigate();
  const user = getActiveUser();
  const [timeframe, setTimeframe] = useState<'day' | 'week' | 'month'>('week');

  if (!user) {
    return (
      <div className="stats-page">
        <h2>Dashboard del Streamer</h2>
        <p>Inicia sesión para ver tus estadísticas.</p>
        <button className="back-button" onClick={() => navigate('/')}>Volver al Inicio</button>
      </div>
    );
  }

  const viewerLevel = getLevelInfo(user.points || 0);

  const chartData = {
    labels: mockData[timeframe].labels,
    datasets: [
      {
        label: 'Horas Transmitidas',
        data: mockData[timeframe].hours,
        borderColor: 'var(--accent)',
        backgroundColor: 'rgba(255, 0, 80, 0.1)',
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
      title: { display: false },
    },
    scales: {
      y: { beginAtZero: true },
    },
  };

  return (
    <div className="stats-page">
      <h2 className="stats-title">Dashboard del Streamer</h2>
      
      <div className="card">
        <h3>Horas de Transmisión</h3>
        <div className="timeframe-buttons">
          <button onClick={() => setTimeframe('day')} className={timeframe === 'day' ? 'active' : ''}>Día</button>
          <button onClick={() => setTimeframe('week')} className={timeframe === 'week' ? 'active' : ''}>Semana</button>
          <button onClick={() => setTimeframe('month')} className={timeframe === 'month' ? 'active' : ''}>Mes</button>
        </div>
        <div className="chart-container">
          <Line options={chartOptions} data={chartData} />
        </div>
      </div>

      <div className="card">
        <h3>Tu Progreso</h3>
        <p className="total-hours">
          Puntos totales: <strong>{(user.points || 0).toLocaleString()}</strong>
        </p>
        <div className="progress-bar-container">
          <div className="progress-bar-fill" style={{ width: `${viewerLevel.progressPercentage}%` }}></div>
        </div>
        <p className="motivation-text">
          Nivel actual: <strong>{viewerLevel.currentLevelName}</strong>.
          {viewerLevel.pointsToNextLevel > 0 
            ? ` Faltan ${viewerLevel.pointsToNextLevel} puntos para el siguiente nivel.`
            : " ¡Has alcanzado el nivel máximo!"
          }
        </p>
      </div>
    </div>
  );
}
