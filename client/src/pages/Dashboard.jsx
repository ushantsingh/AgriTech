import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Spinner } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { FiMapPin, FiSun, FiShoppingBag, FiPlus, FiCloud, FiShoppingCart } from 'react-icons/fi';
import { GiWheat, GiFarmTractor } from 'react-icons/gi';

export default function Dashboard() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [stats, setStats] = useState({ farms: 0, crops: 0, orders: 0 });
  const [weather, setWeather] = useState(null);
  const [recentCrops, setRecentCrops] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [farmsRes, cropsRes, ordersRes] = await Promise.all([
          api.get('/farms'),
          api.get('/crops'),
          api.get('/orders'),
        ]);
        setStats({
          farms: farmsRes.data.length,
          crops: cropsRes.data.filter(c => c.status !== 'harvested').length,
          orders: ordersRes.data.length,
        });
        setRecentCrops(cropsRes.data.slice(0, 3));

        try {
          const weatherRes = await api.get('/weather?location=Delhi');
          setWeather(weatherRes.data);
        } catch { /* weather optional */ }
      } catch (err) {
        console.error('Dashboard load error:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <div className="spinner-wrapper"><Spinner animation="border" variant="success" /></div>;

  const quickActions = [
    { to: '/farms', icon: <FiPlus />, label: t('dashboard.add_farm'), color: 'var(--primary-light)' },
    { to: '/crops', icon: <GiWheat />, label: t('dashboard.add_crop'), color: 'var(--accent)' },
    { to: '/weather', icon: <FiCloud />, label: t('dashboard.view_weather'), color: 'var(--info)' },
    { to: '/marketplace', icon: <FiShoppingCart />, label: t('dashboard.visit_marketplace'), color: 'var(--success)' },
  ];

  return (
    <div className="page-container animate-in" style={{ paddingTop: '5rem' }}>
      <div className="page-header">
        <h1>{t('dashboard.welcome')}, {user?.name?.split(' ')[0]}! 👋</h1>
        <p>{t('dashboard.overview')}</p>
      </div>

      {/* Stat Cards */}
      <Row className="g-3 mb-4">
        <Col md={4}>
          <div className="stat-card">
            <div className="stat-icon"><GiFarmTractor /></div>
            <div className="stat-value">{stats.farms}</div>
            <div className="stat-label">{t('dashboard.total_farms')}</div>
          </div>
        </Col>
        <Col md={4}>
          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'rgba(102,187,106,0.15)', color: 'var(--success)' }}><GiWheat /></div>
            <div className="stat-value">{stats.crops}</div>
            <div className="stat-label">{t('dashboard.total_crops')}</div>
          </div>
        </Col>
        <Col md={4}>
          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'rgba(212,163,115,0.15)', color: 'var(--accent)' }}><FiShoppingBag /></div>
            <div className="stat-value">{stats.orders}</div>
            <div className="stat-label">{t('dashboard.total_orders')}</div>
          </div>
        </Col>
      </Row>

      <Row className="g-3 mb-4">
        {/* Weather Widget */}
        <Col lg={6}>
          <div className="weather-card h-100">
            <h5 style={{ color: 'var(--accent-light)', marginBottom: '1rem' }}>
              <FiSun style={{ marginRight: 8 }} />{t('dashboard.weather')}
            </h5>
            {weather ? (
              <div className="d-flex align-items-center justify-content-between">
                <div>
                  <div className="weather-temp">{weather.temperature}°C</div>
                  <div className="weather-desc">{weather.description}</div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: 4 }}>
                    <FiMapPin size={12} /> {weather.location}
                  </div>
                </div>
                <div style={{ textAlign: 'right', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                  <div>💧 {t('weather.humidity')}: {weather.humidity}%</div>
                  <div>🌧️ {t('weather.rainfall')}: {weather.rainfall}mm</div>
                  <div>💨 {t('weather.wind')}: {weather.windSpeed} km/h</div>
                </div>
              </div>
            ) : (
              <p style={{ color: 'var(--text-muted)' }}>{t('common.no_data')}</p>
            )}
          </div>
        </Col>

        {/* Quick Actions */}
        <Col lg={6}>
          <Card className="card-agri h-100" style={{ padding: '1.5rem' }}>
            <h5 style={{ color: 'var(--text-primary)', marginBottom: '1rem' }}>{t('dashboard.quick_actions')}</h5>
            <Row className="g-2">
              {quickActions.map((a, i) => (
                <Col xs={6} key={i}>
                  <Link to={a.to} className="d-block p-3 text-center" style={{
                    background: 'var(--surface)', borderRadius: 'var(--radius)',
                    border: '1px solid var(--border-color)', transition: 'var(--transition)',
                    color: a.color, textDecoration: 'none', fontSize: '0.85rem', fontWeight: 500,
                  }}>
                    <div style={{ fontSize: '1.5rem', marginBottom: 6 }}>{a.icon}</div>
                    {a.label}
                  </Link>
                </Col>
              ))}
            </Row>
          </Card>
        </Col>
      </Row>

      {/* Recent Crops */}
      {recentCrops.length > 0 && (
        <Card className="card-agri" style={{ padding: '1.5rem' }}>
          <h5 style={{ color: 'var(--text-primary)', marginBottom: '1rem' }}>{t('dashboard.recent_crops')}</h5>
          <div className="table-responsive">
            <table className="table table-agri mb-0">
              <thead>
                <tr>
                  <th>{t('crops.crop_name')}</th>
                  <th>{t('crops.variety')}</th>
                  <th>{t('crops.status')}</th>
                  <th>{t('farms.farm_name')}</th>
                </tr>
              </thead>
              <tbody>
                {recentCrops.map((c) => (
                  <tr key={c._id}>
                    <td style={{ fontWeight: 500 }}>{c.name}</td>
                    <td style={{ color: 'var(--text-muted)' }}>{c.variety || '-'}</td>
                    <td><span className={`badge-status badge-${c.status}`}>{c.status}</span></td>
                    <td style={{ color: 'var(--text-secondary)' }}>{c.farm?.name || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
