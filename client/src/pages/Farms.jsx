import { useState, useEffect } from 'react';
import { Row, Col, Card, Button, Modal, Form, Alert, Spinner } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import api from '../../services/api';
import { toast } from 'react-toastify';
import { FiEdit2, FiTrash2, FiPlus, FiMapPin, FiDroplet } from 'react-icons/fi';
import { GiFarmTractor } from 'react-icons/gi';

const emptyFarm = { name: '', size: '', sizeUnit: 'acres', soilType: 'loamy', waterSource: 'well', location: { district: '', state: '' } };

export default function Farms() {
  const { t } = useTranslation();
  const [farms, setFarms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyFarm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const loadFarms = async () => {
    try {
      const { data } = await api.get('/farms');
      setFarms(data);
    } catch { toast.error(t('common.error')); }
    finally { setLoading(false); }
  };

  useEffect(() => { loadFarms(); }, []);

  const openNew = () => { setEditing(null); setForm(emptyFarm); setError(''); setShowModal(true); };
  const openEdit = (farm) => {
    setEditing(farm._id);
    setForm({ name: farm.name, size: farm.size, sizeUnit: farm.sizeUnit, soilType: farm.soilType, waterSource: farm.waterSource, location: farm.location || { district: '', state: '' } });
    setError('');
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      if (editing) {
        await api.put(`/farms/${editing}`, form);
        toast.success('Farm updated');
      } else {
        await api.post('/farms', form);
        toast.success('Farm created');
      }
      setShowModal(false);
      loadFarms();
    } catch (err) {
      setError(err.response?.data?.message || t('common.error'));
    } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm(t('farms.delete_confirm'))) return;
    try {
      await api.delete(`/farms/${id}`);
      toast.success('Farm deleted');
      loadFarms();
    } catch { toast.error(t('common.error')); }
  };

  if (loading) return <div className="spinner-wrapper"><Spinner animation="border" variant="success" /></div>;

  return (
    <div className="page-container animate-in" style={{ paddingTop: '5rem' }}>
      <div className="page-header d-flex justify-content-between align-items-center">
        <div>
          <h1>{t('farms.title')}</h1>
          <p>{farms.length} farm{farms.length !== 1 ? 's' : ''} registered</p>
        </div>
        <Button className="btn-agri" onClick={openNew}><FiPlus className="me-1" /> {t('farms.add_farm')}</Button>
      </div>

      {farms.length === 0 ? (
        <Card className="card-agri text-center p-5">
          <GiFarmTractor size={48} style={{ color: 'var(--text-muted)', margin: '0 auto 1rem' }} />
          <p style={{ color: 'var(--text-muted)' }}>{t('farms.no_farms')}</p>
          <Button className="btn-agri" onClick={openNew}><FiPlus className="me-1" /> {t('farms.add_farm')}</Button>
        </Card>
      ) : (
        <Row className="g-3">
          {farms.map((farm) => (
            <Col md={6} lg={4} key={farm._id}>
              <Card className="card-agri h-100" style={{ padding: '1.25rem' }}>
                <div className="d-flex justify-content-between mb-2">
                  <h5 style={{ color: 'var(--text-primary)', fontWeight: 600, margin: 0 }}>{farm.name}</h5>
                  <div>
                    <Button variant="link" size="sm" style={{ color: 'var(--primary-light)' }} onClick={() => openEdit(farm)}><FiEdit2 /></Button>
                    <Button variant="link" size="sm" style={{ color: 'var(--danger)' }} onClick={() => handleDelete(farm._id)}><FiTrash2 /></Button>
                  </div>
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  <div className="mb-1"><FiMapPin size={12} className="me-1" />{farm.location?.district || '-'}, {farm.location?.state || '-'}</div>
                  <div className="mb-1">📐 {farm.size} {farm.sizeUnit}</div>
                  <div className="mb-1">🌱 {farm.soilType}</div>
                  <div><FiDroplet size={12} className="me-1" />{farm.waterSource}</div>
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      )}

      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>{editing ? t('farms.edit_farm') : t('farms.add_farm')}</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            {error && <Alert variant="danger" className="py-2">{error}</Alert>}
            <Form.Group className="mb-3">
              <Form.Label>{t('farms.farm_name')}</Form.Label>
              <Form.Control required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </Form.Group>
            <Row className="g-2 mb-3">
              <Col>
                <Form.Label>{t('farms.size')}</Form.Label>
                <Form.Control type="number" step="0.1" required value={form.size} onChange={(e) => setForm({ ...form, size: e.target.value })} />
              </Col>
              <Col>
                <Form.Label>Unit</Form.Label>
                <Form.Select value={form.sizeUnit} onChange={(e) => setForm({ ...form, sizeUnit: e.target.value })}>
                  <option value="acres">Acres</option>
                  <option value="hectares">Hectares</option>
                  <option value="bigha">Bigha</option>
                </Form.Select>
              </Col>
            </Row>
            <Row className="g-2 mb-3">
              <Col>
                <Form.Label>{t('farms.district')}</Form.Label>
                <Form.Control value={form.location?.district || ''} onChange={(e) => setForm({ ...form, location: { ...form.location, district: e.target.value } })} />
              </Col>
              <Col>
                <Form.Label>{t('farms.state')}</Form.Label>
                <Form.Control value={form.location?.state || ''} onChange={(e) => setForm({ ...form, location: { ...form.location, state: e.target.value } })} />
              </Col>
            </Row>
            <Row className="g-2 mb-3">
              <Col>
                <Form.Label>{t('farms.soil_type')}</Form.Label>
                <Form.Select value={form.soilType} onChange={(e) => setForm({ ...form, soilType: e.target.value })}>
                  {['clay', 'sandy', 'loamy', 'silt', 'peat', 'chalky', 'other'].map(s => <option key={s} value={s}>{s}</option>)}
                </Form.Select>
              </Col>
              <Col>
                <Form.Label>{t('farms.water_source')}</Form.Label>
                <Form.Select value={form.waterSource} onChange={(e) => setForm({ ...form, waterSource: e.target.value })}>
                  {['well', 'canal', 'rain', 'river', 'borewell', 'other'].map(w => <option key={w} value={w}>{w}</option>)}
                </Form.Select>
              </Col>
            </Row>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>{t('common.cancel')}</Button>
            <Button type="submit" className="btn-agri" disabled={saving}>{saving ? t('common.loading') : t('common.save')}</Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
}
