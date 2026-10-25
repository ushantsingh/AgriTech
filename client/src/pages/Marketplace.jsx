import { useState, useEffect } from 'react';
import { Row, Col, Card, Button, Spinner, Form } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import api from '../../services/api';
import { toast } from 'react-toastify';
import { FiShoppingCart } from 'react-icons/fi';

const categories = ['', 'seed', 'fertilizer', 'pesticide', 'equipment'];
const catLabels = { '': 'marketplace.all', seed: 'marketplace.seeds', fertilizer: 'marketplace.fertilizers', pesticide: 'marketplace.pesticides', equipment: 'marketplace.equipment' };

export default function Marketplace({ addToCart }) {
  const { t } = useTranslation();
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const url = category ? `/resources?category=${category}` : '/resources';
      const { data } = await api.get(url);
      setResources(data.resources || []);
    } catch { toast.error(t('common.error')); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [category]);

  return (
    <div className="page-container animate-in" style={{ paddingTop: '5rem' }}>
      <div className="page-header">
        <h1>{t('marketplace.title')}</h1>
      </div>

      {/* Category Filter */}
      <div className="d-flex gap-2 mb-4 flex-wrap">
        {categories.map((cat) => (
          <Button key={cat}
            className={category === cat ? 'btn-agri' : 'btn-agri-outline'}
            size="sm"
            onClick={() => setCategory(cat)}>
            {t(catLabels[cat])}
          </Button>
        ))}
      </div>

      {loading ? (
        <div className="spinner-wrapper"><Spinner animation="border" variant="success" /></div>
      ) : resources.length === 0 ? (
        <Card className="card-agri text-center p-5">
          <p style={{ color: 'var(--text-muted)' }}>{t('common.no_data')}</p>
        </Card>
      ) : (
        <Row className="g-3">
          {resources.map((res) => (
            <Col sm={6} lg={4} xl={3} key={res._id}>
              <Card className="card-agri h-100" style={{ padding: '1.25rem' }}>
                <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', fontWeight: 600, color: 'var(--primary-light)', marginBottom: 4 }}>
                  {res.category}
                </div>
                <h6 style={{ color: 'var(--text-primary)', fontWeight: 600, minHeight: 40, marginBottom: 8 }}>{res.name}</h6>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', minHeight: 40 }}>{res.description?.slice(0, 80)}{res.description?.length > 80 ? '...' : ''}</p>
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <span style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--accent-light)' }}>₹{res.price}</span>
                  <span style={{ fontSize: '0.75rem', color: res.stock > 0 ? 'var(--success)' : 'var(--danger)' }}>
                    {res.stock > 0 ? `${t('marketplace.stock')}: ${res.stock} ${res.unit}` : t('marketplace.out_of_stock')}
                  </span>
                </div>
                <Button
                  className="btn-agri w-100"
                  size="sm"
                  disabled={res.stock <= 0}
                  onClick={() => { addToCart(res); toast.success(`${res.name} added to cart`); }}>
                  <FiShoppingCart className="me-1" /> {t('marketplace.add_to_cart')}
                </Button>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </div>
  );
}
