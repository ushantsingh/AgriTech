import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Container, Form, Button, Alert } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { GiWheat } from 'react-icons/gi';

export default function Login() {
  const { t } = useTranslation();
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card animate-in">
        <div className="text-center mb-4">
          <GiWheat size={40} style={{ color: 'var(--primary-light)' }} />
          <h2 className="mt-2">{t('auth.login_title')}</h2>
          <p className="subtitle">{t('auth.login_subtitle')}</p>
        </div>
        {error && <Alert variant="danger" className="py-2">{error}</Alert>}
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>{t('auth.email')}</Form.Label>
            <Form.Control type="email" required value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="you@example.com" />
          </Form.Group>
          <Form.Group className="mb-4">
            <Form.Label>{t('auth.password')}</Form.Label>
            <Form.Control type="password" required value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="••••••" />
          </Form.Group>
          <Button type="submit" className="btn-agri w-100 mb-3" disabled={loading}>
            {loading ? t('common.loading') : t('auth.login_btn')}
          </Button>
          <p className="text-center" style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            {t('auth.no_account')} <Link to="/register">{t('nav.register')}</Link>
          </p>
        </Form>
      </div>
    </div>
  );
}
