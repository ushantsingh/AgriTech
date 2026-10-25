import { useState } from 'react';
import { Card, Button, Form, Row, Col, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../../services/api';
import { toast } from 'react-toastify';
import { FiTrash2, FiMinus, FiPlus, FiShoppingBag } from 'react-icons/fi';

export default function Cart({ cart, setCart }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [address, setAddress] = useState('');
  const [placing, setPlacing] = useState(false);

  const updateQty = (id, delta) => {
    setCart(cart.map(item =>
      item._id === id ? { ...item, qty: Math.max(1, Math.min(item.qty + delta, item.stock)) } : item
    ));
  };

  const remove = (id) => setCart(cart.filter(item => item._id !== id));

  const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);

  const placeOrder = async () => {
    if (cart.length === 0) return;
    setPlacing(true);
    try {
      await api.post('/orders', {
        items: cart.map(item => ({ resource: item._id, quantity: item.qty })),
        shippingAddress: address,
      });
      toast.success('Order placed successfully!');
      setCart([]);
      navigate('/orders');
    } catch (err) {
      toast.error(err.response?.data?.message || t('common.error'));
    } finally {
      setPlacing(false);
    }
  };

  return (
    <div className="page-container animate-in" style={{ paddingTop: '5rem' }}>
      <div className="page-header">
        <h1>{t('nav.cart')}</h1>
      </div>

      {cart.length === 0 ? (
        <Card className="card-agri text-center p-5">
          <FiShoppingBag size={48} style={{ color: 'var(--text-muted)', margin: '0 auto 1rem' }} />
          <p style={{ color: 'var(--text-muted)' }}>Your cart is empty</p>
          <Button className="btn-agri" onClick={() => navigate('/marketplace')}>Browse Marketplace</Button>
        </Card>
      ) : (
        <Row className="g-4">
          <Col lg={8}>
            {cart.map((item) => (
              <Card key={item._id} className="card-agri mb-3" style={{ padding: '1rem' }}>
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h6 style={{ color: 'var(--text-primary)', margin: 0, fontWeight: 600 }}>{item.name}</h6>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{item.category} · ₹{item.price}/{item.unit}</span>
                  </div>
                  <div className="d-flex align-items-center gap-2">
                    <Button size="sm" variant="outline-secondary" onClick={() => updateQty(item._id, -1)}><FiMinus /></Button>
                    <span style={{ fontWeight: 600, minWidth: 28, textAlign: 'center' }}>{item.qty}</span>
                    <Button size="sm" variant="outline-secondary" onClick={() => updateQty(item._id, 1)}><FiPlus /></Button>
                    <span style={{ fontWeight: 600, color: 'var(--accent-light)', minWidth: 70, textAlign: 'right' }}>
                      ₹{item.price * item.qty}
                    </span>
                    <Button size="sm" variant="link" style={{ color: 'var(--danger)' }} onClick={() => remove(item._id)}>
                      <FiTrash2 />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </Col>
          <Col lg={4}>
            <Card className="card-agri" style={{ padding: '1.5rem', position: 'sticky', top: '5rem' }}>
              <h5 style={{ color: 'var(--text-primary)', marginBottom: '1rem' }}>Order Summary</h5>
              <div className="d-flex justify-content-between mb-2" style={{ color: 'var(--text-secondary)' }}>
                <span>Items ({cart.length})</span>
                <span>₹{total}</span>
              </div>
              <hr style={{ borderColor: 'var(--border-color)' }} />
              <div className="d-flex justify-content-between mb-3">
                <span style={{ fontWeight: 600 }}>Total</span>
                <span style={{ fontWeight: 700, fontSize: '1.2rem', color: 'var(--accent-light)' }}>₹{total}</span>
              </div>
              <Form.Group className="mb-3">
                <Form.Label>{t('marketplace.shipping_address')}</Form.Label>
                <Form.Control as="textarea" rows={2} value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Enter delivery address" />
              </Form.Group>
              <Button className="btn-agri w-100" onClick={placeOrder} disabled={placing}>
                {placing ? t('common.loading') : t('marketplace.place_order')}
              </Button>
            </Card>
          </Col>
        </Row>
      )}
    </div>
  );
}
