import React, { useState } from 'react';

const weatherData = [
  { day: 'Mon', high: 28, low: 18, icon: '☀️', condition: 'Sunny',        humidity: 45, wind: 12 },
  { day: 'Tue', high: 24, low: 16, icon: '⛅', condition: 'Partly Cloudy', humidity: 60, wind: 18 },
  { day: 'Wed', high: 19, low: 13, icon: '🌧️', condition: 'Rainy',         humidity: 85, wind: 25 },
  { day: 'Thu', high: 22, low: 15, icon: '🌤️', condition: 'Mostly Sunny',  humidity: 52, wind: 10 },
  { day: 'Fri', high: 30, low: 20, icon: '☀️', condition: 'Sunny',         humidity: 38, wind: 8  },
  { day: 'Sat', high: 27, low: 17, icon: '⛅', condition: 'Cloudy',        humidity: 65, wind: 20 },
  { day: 'Sun', high: 25, low: 16, icon: '🌦️', condition: 'Showers',       humidity: 72, wind: 15 },
];

const cities = ['New Delhi', 'Mumbai', 'Bangalore', 'Kolkata', 'Chennai'];

const styles = {
  app: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 50%, #0f172a 100%)',
    fontFamily: "'Segoe UI', system-ui, sans-serif",
    color: '#e2e8f0',
  },
  header: {
    background: 'rgba(255,255,255,0.05)',
    backdropFilter: 'blur(10px)',
    borderBottom: '1px solid rgba(255,255,255,0.1)',
    padding: '16px 32px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  logo: { fontSize: '22px', fontWeight: '700', color: '#60a5fa' },
  badge: {
    background: 'rgba(96,165,250,0.2)',
    border: '1px solid rgba(96,165,250,0.4)',
    color: '#60a5fa',
    padding: '4px 14px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '600',
  },
  main: { maxWidth: '900px', margin: '0 auto', padding: '32px 24px' },
  cityRow: { display: 'flex', gap: '10px', marginBottom: '32px', flexWrap: 'wrap' },
  cityBtn: (active) => ({
    padding: '8px 18px',
    borderRadius: '24px',
    border: active ? '1px solid #60a5fa' : '1px solid rgba(255,255,255,0.15)',
    background: active ? 'rgba(96,165,250,0.25)' : 'rgba(255,255,255,0.05)',
    color: active ? '#60a5fa' : '#94a3b8',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: active ? '600' : '400',
  }),
  heroCard: {
    background: 'rgba(255,255,255,0.07)',
    border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: '20px',
    padding: '36px',
    marginBottom: '24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: '24px',
  },
  tempDisplay: { fontSize: '80px', fontWeight: '700', lineHeight: 1, color: '#f1f5f9', letterSpacing: '-4px' },
  tempUnit: { fontSize: '36px', fontWeight: '300', color: '#94a3b8', verticalAlign: 'super', letterSpacing: '0' },
  heroIcon: { fontSize: '90px', lineHeight: 1 },
  statsRow: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' },
  statCard: {
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '14px',
    padding: '20px',
    textAlign: 'center',
  },
  statLabel: { fontSize: '12px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' },
  statValue: { fontSize: '24px', fontWeight: '600', color: '#e2e8f0' },
  weekGrid: { display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '10px' },
  dayCard: (active) => ({
    background: active ? 'rgba(96,165,250,0.2)' : 'rgba(255,255,255,0.05)',
    border: active ? '1px solid rgba(96,165,250,0.5)' : '1px solid rgba(255,255,255,0.08)',
    borderRadius: '14px',
    padding: '14px 8px',
    textAlign: 'center',
    cursor: 'pointer',
  }),
  sectionTitle: { fontSize: '13px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '16px', marginTop: '28px' },
};

export default function App() {
  const [city, setCity] = useState('New Delhi');
  const [activeDay, setActiveDay] = useState(0);
  const today = weatherData[activeDay];

  return (
    <div style={styles.app}>
      <header style={styles.header}>
        <span style={styles.logo}>⛅ WeatherVista</span>
        <span style={styles.badge}>APP ONE · PORT 8081 · /first</span>
      </header>
      <main style={styles.main}>
        <div style={styles.cityRow}>
          {cities.map(c => (
            <button key={c} style={styles.cityBtn(city === c)} onClick={() => setCity(c)}>{c}</button>
          ))}
        </div>
        <div style={styles.heroCard}>
          <div>
            <div style={{ color: '#94a3b8', fontSize: '16px', marginBottom: '8px' }}>📍 {city} — {today.day}</div>
            <div style={styles.tempDisplay}>{today.high}<span style={styles.tempUnit}>°C</span></div>
            <div style={{ color: '#60a5fa', fontSize: '18px', marginTop: '8px' }}>{today.condition}</div>
            <div style={{ color: '#64748b', fontSize: '13px', marginTop: '4px' }}>
              Feels like {today.high - 2}°C · Low {today.low}°C
            </div>
          </div>
          <div style={styles.heroIcon}>{today.icon}</div>
        </div>
        <div style={styles.statsRow}>
          <div style={styles.statCard}>
            <div style={styles.statLabel}>💧 Humidity</div>
            <div style={styles.statValue}>{today.humidity}%</div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statLabel}>💨 Wind Speed</div>
            <div style={styles.statValue}>{today.wind} km/h</div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statLabel}>🌡️ High / Low</div>
            <div style={styles.statValue}>{today.high}° / {today.low}°</div>
          </div>
        </div>
        <div style={styles.sectionTitle}>7-Day Forecast</div>
        <div style={styles.weekGrid}>
          {weatherData.map((d, i) => (
            <div key={d.day} style={styles.dayCard(i === activeDay)} onClick={() => setActiveDay(i)}>
              <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '8px' }}>{d.day}</div>
              <span style={{ fontSize: '22px', display: 'block', marginBottom: '8px' }}>{d.icon}</span>
              <div style={{ fontSize: '15px', fontWeight: '600', color: '#f1f5f9' }}>{d.high}°</div>
              <div style={{ fontSize: '12px', color: '#64748b' }}>{d.low}°</div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
