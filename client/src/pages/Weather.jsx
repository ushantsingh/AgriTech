import { useState, useEffect } from 'react';
import { Row, Col, Card, Form, Spinner, Alert } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import api from '../../services/api';
import { FiSun, FiDroplet, FiWind, FiAlertTriangle, FiSearch } from 'react-icons/fi';

export default function Weather() {
  const { t } = useTranslation();
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [location, setLocation] = useState('Delhi');
  const [searchInput, setSearchInput] = useState('Delhi');

  const loadWeather = async (loc) => {
    setLoading(true);
    try {
      const { data } = await api.get(`/weather?location=${encodeURIComponent(loc)}`);
      setWeather(data);
    } catch {
      setWeather(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadWeather(location); }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchInput.trim()) {
      setLocation(searchInput.trim());
      loadWeather(searchInput.trim());
    }
  };

  const forecastChartData = weather?.forecast?.map((d) => ({
    date: new Date(d.date).toLocaleDateString('en', { weekday: 'short' }),
    min: d.tempMin,
    max: d.tempMax,
    humidity: d.humidity,
  })) || [];

  return (
    <div className="page-container animate-in" style={{ paddingTop: '5rem' }}>
      <div className="page-header">
        <h1>{t('weather.title')}</h1>
      </div>

      {/* Search */}
      <Form onSubmit={handleSearch} className="mb-4">
        <div className="d-flex gap-2" style={{ maxWidth: 400 }}>
          <Form.Control
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder={t('weather.search')}
          />
          <button type="submit" className="btn btn-agri"><FiSearch /></button>
        </div>
      </Form>

      {loading ? (
        <div className="spinner-wrapper"><Spinner animation="border" variant="success" /></div>
      ) : !weather ? (
        <Alert variant="warning">Could not load weather data.</Alert>
      ) : (
        <>
          {/* Current Weather */}
          <div className="weather-card mb-4">
            <Row className="align-items-center">
              <Col md={4}>
                <div className="weather-temp">{weather.temperature}°C</div>
                <div className="weather-desc">{weather.description}</div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: 4 }}>📍 {weather.location}</div>
              </Col>
              <Col md={8}>
                <Row className="g-3 mt-2 mt-md-0">
                  <Col xs={4} className="text-center">
                    <FiDroplet size={20} style={{ color: 'var(--info)' }} />
                    <div style={{ fontSize: '1.4rem', fontWeight: 600, color: 'white' }}>{weather.humidity}%</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{t('weather.humidity')}</div>
                  </Col>
                  <Col xs={4} className="text-center">
                    <FiSun size={20} style={{ color: 'var(--accent-light)' }} />
                    <div style={{ fontSize: '1.4rem', fontWeight: 600, color: 'white' }}>{weather.rainfall}mm</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{t('weather.rainfall')}</div>
                  </Col>
                  <Col xs={4} className="text-center">
                    <FiWind size={20} style={{ color: 'var(--text-secondary)' }} />
                    <div style={{ fontSize: '1.4rem', fontWeight: 600, color: 'white' }}>{weather.windSpeed} km/h</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{t('weather.wind')}</div>
                  </Col>
                </Row>
              </Col>
            </Row>
          </div>

          {/* Forecast Chart */}
          {forecastChartData.length > 0 && (
            <Row className="g-3 mb-4">
              <Col lg={6}>
                <div className="chart-container">
                  <h6 style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>🌡️ {t('weather.forecast')} - Temperature</h6>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={forecastChartData}>
                      <XAxis dataKey="date" tick={{ fill: 'var(--text-muted)', fontSize: 12 }} />
                      <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 12 }} />
                      <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 8 }} />
                      <Bar dataKey="min" fill="#29b6f6" name="Min °C" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="max" fill="#ef5350" name="Max °C" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Col>
              <Col lg={6}>
                <div className="chart-container">
                  <h6 style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>💧 {t('weather.forecast')} - Humidity</h6>
                  <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={forecastChartData}>
                      <XAxis dataKey="date" tick={{ fill: 'var(--text-muted)', fontSize: 12 }} />
                      <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 12 }} />
                      <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 8 }} />
                      <Line type="monotone" dataKey="humidity" stroke="#40916c" strokeWidth={2} dot={{ fill: '#40916c' }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </Col>
            </Row>
          )}

          {/* Alerts */}
          {weather.alerts?.length > 0 && (
            <Card className="card-agri" style={{ padding: '1.5rem' }}>
              <h5 style={{ color: 'var(--warning)', marginBottom: '1rem' }}>
                <FiAlertTriangle className="me-2" />{t('weather.alerts')}
              </h5>
              {weather.alerts.map((alert, i) => (
                <Alert key={i} variant={alert.severity === 'high' ? 'danger' : alert.severity === 'medium' ? 'warning' : 'info'} className="mb-2">
                  <strong style={{ textTransform: 'capitalize' }}>{alert.type}:</strong> {alert.message}
                </Alert>
              ))}
            </Card>
          )}
        </>
      )}
    </div>
  );
}
