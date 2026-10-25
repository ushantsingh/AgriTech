import { useState, useEffect } from 'react';
import { Card, Spinner, Badge } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import api from '../../services/api';
import { toast } from 'react-toastify';

export default function Orders() {
  const { t } = useTranslation();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get('/orders');
        setOrders(data);
      } catch { toast.error(t('common.error')); }
      finally { setLoading(false); }
    };
    load();
  }, []);

  if (loading) return <div className="spinner-wrapper"><Spinner animation="border" variant="success" /></div>;

  return (
    <div className="page-container animate-in" style={{ paddingTop: '5rem' }}>
      <div className="page-header">
        <h1>{t('orders.title')}</h1>
      </div>

      {orders.length === 0 ? (
        <Card className="card-agri text-center p-5">
          <p style={{ color: 'var(--text-muted)' }}>{t('orders.no_orders')}</p>
        </Card>
      ) : (
        orders.map((order) => (
          <Card key={order._id} className="card-agri mb-3" style={{ padding: '1.25rem' }}>
            <div className="d-flex justify-content-between align-items-start mb-2">
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{t('orders.order_id')}</span>
                <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.9rem' }}>#{order._id.slice(-8)}</div>
              </div>
              <span className={`badge-status badge-${order.status}`}>{order.status}</span>
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: 8 }}>
              {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
            </div>
            <div className="table-responsive">
              <table className="table table-agri table-sm mb-2">
                <thead>
                  <tr>
                    <th>Item</th>
                    <th>Qty</th>
                    <th>Price</th>
                  </tr>
                </thead>
                <tbody>
                  {order.items.map((item, i) => (
                    <tr key={i}>
                      <td>{item.name}</td>
                      <td>{item.quantity}</td>
                      <td>₹{item.price * item.quantity}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="d-flex justify-content-between" style={{ fontSize: '0.9rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>
                {order.shippingAddress && `📦 ${order.shippingAddress}`}
              </span>
              <span style={{ fontWeight: 700, color: 'var(--accent-light)' }}>
                {t('orders.total')}: ₹{order.totalAmount}
              </span>
            </div>
          </Card>
        ))
      )}
    </div>
  );
}
