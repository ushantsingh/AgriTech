import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Form, Button, Alert } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { GiWheat } from 'react-icons/gi';

export default function Register() {
  const { t } = useTranslation();
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(form);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card animate-in">
        <div className="text-center mb-4">
          <GiWheat size={40} style={{ color: 'var(--primary-light)' }} />
          <h2 className="mt-2">{t('auth.register_title')}</h2>
          <p className="subtitle">{t('auth.register_subtitle')}</p>
        </div>
        {error && <Alert variant="danger" className="py-2">{error}</Alert>}
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>{t('auth.name')}</Form.Label>
            <Form.Control type="text" required value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>{t('auth.email')}</Form.Label>
            <Form.Control type="email" required value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>{t('auth.phone')}</Form.Label>
            <Form.Control type="tel" value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          </Form.Group>
          <Form.Group className="mb-4">
            <Form.Label>{t('auth.password')}</Form.Label>
            <Form.Control type="password" required minLength={6} value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })} />
          </Form.Group>
          <Button type="submit" className="btn-agri w-100 mb-3" disabled={loading}>
            {loading ? t('common.loading') : t('auth.register_btn')}
          </Button>
          <p className="text-center" style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            {t('auth.have_account')} <Link to="/login">{t('nav.login')}</Link>
          </p>
        </Form>
      </div>
    </div>
  );
}
