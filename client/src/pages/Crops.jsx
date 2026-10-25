import { useState, useEffect } from 'react';
import { Row, Col, Card, Button, Modal, Form, Alert, Spinner, Badge } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import api from '../../services/api';
import { toast } from 'react-toastify';
import { FiPlus, FiTrash2, FiActivity } from 'react-icons/fi';
import { GiWheat } from 'react-icons/gi';

const emptyCrop = { name: '', variety: '', farm: '', sowingDate: '', expectedHarvest: '', status: 'planted' };

export default function Crops() {
  const { t } = useTranslation();
  const [crops, setCrops] = useState([]);
  const [farms, setFarms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showSoilModal, setShowSoilModal] = useState(false);
  const [selectedCrop, setSelectedCrop] = useState(null);
  const [form, setForm] = useState(emptyCrop);
  const [soilForm, setSoilForm] = useState({ pH: 7, nitrogen: 30, phosphorus: 20, potassium: 25, moisture: 50 });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const load = async () => {
    try {
      const [cropsRes, farmsRes] = await Promise.all([api.get('/crops'), api.get('/farms')]);
      setCrops(cropsRes.data);
      setFarms(farmsRes.data);
    } catch { toast.error(t('common.error')); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await api.post('/crops', form);
      toast.success('Crop added');
      setShowModal(false);
      load();
    } catch (err) {
      setError(err.response?.data?.message || t('common.error'));
    } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this crop?')) return;
    try {
      await api.delete(`/crops/${id}`);
      toast.success('Crop deleted');
      load();
    } catch { toast.error(t('common.error')); }
  };

  const openSoil = async (crop) => {
    try {
      const { data } = await api.get(`/crops/${crop._id}`);
      setSelectedCrop(data);
      if (data.soilHealth) {
        setSoilForm({
          pH: data.soilHealth.pH || 7,
          nitrogen: data.soilHealth.nitrogen || 0,
          phosphorus: data.soilHealth.phosphorus || 0,
          potassium: data.soilHealth.potassium || 0,
          moisture: data.soilHealth.moisture || 50,
        });
      }
      setShowSoilModal(true);
    } catch { toast.error(t('common.error')); }
  };

  const handleSoilUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await api.put(`/crops/${selectedCrop._id}/soil`, soilForm);
      setSelectedCrop({ ...selectedCrop, soilHealth: data.soilHealth, recommendations: data.recommendations });
      toast.success('Soil data updated');
      load();
    } catch { toast.error(t('common.error')); }
    finally { setSaving(false); }
  };

  if (loading) return <div className="spinner-wrapper"><Spinner animation="border" variant="success" /></div>;

  const soilRadarData = selectedCrop?.soilHealth ? [
    { metric: 'pH', value: (selectedCrop.soilHealth.pH / 14) * 100 },
    { metric: 'N', value: Math.min(selectedCrop.soilHealth.nitrogen, 100) },
    { metric: 'P', value: Math.min(selectedCrop.soilHealth.phosphorus, 100) },
    { metric: 'K', value: Math.min(selectedCrop.soilHealth.potassium, 100) },
    { metric: 'Moisture', value: selectedCrop.soilHealth.moisture },
  ] : [];

  return (
    <div className="page-container animate-in" style={{ paddingTop: '5rem' }}>
      <div className="page-header d-flex justify-content-between align-items-center">
        <div>
          <h1>{t('crops.title')}</h1>
          <p>{crops.length} crop{crops.length !== 1 ? 's' : ''} tracked</p>
        </div>
        <Button className="btn-agri" onClick={() => { setForm(emptyCrop); setError(''); setShowModal(true); }}>
          <FiPlus className="me-1" /> {t('crops.add_crop')}
        </Button>
      </div>

      {crops.length === 0 ? (
        <Card className="card-agri text-center p-5">
          <GiWheat size={48} style={{ color: 'var(--text-muted)', margin: '0 auto 1rem' }} />
          <p style={{ color: 'var(--text-muted)' }}>No crops added yet.</p>
        </Card>
      ) : (
        <Row className="g-3">
          {crops.map((crop) => (
            <Col md={6} lg={4} key={crop._id}>
              <Card className="card-agri h-100" style={{ padding: '1.25rem' }}>
                <div className="d-flex justify-content-between mb-2">
                  <h5 style={{ color: 'var(--text-primary)', fontWeight: 600, margin: 0 }}>{crop.name}</h5>
                  <span className={`badge-status badge-${crop.status}`}>{crop.status}</span>
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  <div className="mb-1">🌾 {crop.variety || '-'}</div>
                  <div className="mb-1">🏡 {crop.farm?.name || '-'}</div>
                  <div className="mb-1">📅 Sown: {crop.sowingDate ? new Date(crop.sowingDate).toLocaleDateString() : '-'}</div>
                  {crop.expectedHarvest && <div className="mb-1">🎯 Harvest: {new Date(crop.expectedHarvest).toLocaleDateString()}</div>}
                </div>
                <div className="mt-2 d-flex gap-2">
                  <Button size="sm" className="btn-agri-outline" onClick={() => openSoil(crop)}>
                    <FiActivity size={12} className="me-1" />{t('crops.soil_health')}
                  </Button>
                  <Button size="sm" variant="link" style={{ color: 'var(--danger)' }} onClick={() => handleDelete(crop._id)}>
                    <FiTrash2 />
                  </Button>
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      )}

      {/* Add Crop Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton><Modal.Title>{t('crops.add_crop')}</Modal.Title></Modal.Header>
        <Form onSubmit={handleCreate}>
          <Modal.Body>
            {error && <Alert variant="danger" className="py-2">{error}</Alert>}
            <Form.Group className="mb-3">
              <Form.Label>{t('crops.crop_name')}</Form.Label>
              <Form.Control required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>{t('crops.variety')}</Form.Label>
              <Form.Control value={form.variety} onChange={(e) => setForm({ ...form, variety: e.target.value })} />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Farm</Form.Label>
              <Form.Select required value={form.farm} onChange={(e) => setForm({ ...form, farm: e.target.value })}>
                <option value="">Select Farm</option>
                {farms.map(f => <option key={f._id} value={f._id}>{f.name}</option>)}
              </Form.Select>
            </Form.Group>
            <Row className="g-2 mb-3">
              <Col>
                <Form.Label>{t('crops.sowing_date')}</Form.Label>
                <Form.Control type="date" value={form.sowingDate} onChange={(e) => setForm({ ...form, sowingDate: e.target.value })} />
              </Col>
              <Col>
                <Form.Label>{t('crops.expected_harvest')}</Form.Label>
                <Form.Control type="date" value={form.expectedHarvest} onChange={(e) => setForm({ ...form, expectedHarvest: e.target.value })} />
              </Col>
            </Row>
            <Form.Group className="mb-3">
              <Form.Label>{t('crops.status')}</Form.Label>
              <Form.Select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                {['planned', 'planted', 'growing', 'harvested'].map(s => <option key={s} value={s}>{s}</option>)}
              </Form.Select>
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>{t('common.cancel')}</Button>
            <Button type="submit" className="btn-agri" disabled={saving}>{saving ? t('common.loading') : t('common.save')}</Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Soil Health Modal */}
      <Modal show={showSoilModal} onHide={() => setShowSoilModal(false)} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title>{t('crops.soil_health')} - {selectedCrop?.name}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Row>
            <Col md={6}>
              <h6 style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>{t('crops.update_soil')}</h6>
              <Form onSubmit={handleSoilUpdate}>
                <Form.Group className="mb-2">
                  <Form.Label>{t('crops.ph')}: {soilForm.pH}</Form.Label>
                  <Form.Range min={0} max={14} step={0.1} value={soilForm.pH} onChange={(e) => setSoilForm({ ...soilForm, pH: parseFloat(e.target.value) })} />
                </Form.Group>
                <Form.Group className="mb-2">
                  <Form.Label>{t('crops.nitrogen')}: {soilForm.nitrogen}</Form.Label>
                  <Form.Range min={0} max={100} value={soilForm.nitrogen} onChange={(e) => setSoilForm({ ...soilForm, nitrogen: parseInt(e.target.value) })} />
                </Form.Group>
                <Form.Group className="mb-2">
                  <Form.Label>{t('crops.phosphorus')}: {soilForm.phosphorus}</Form.Label>
                  <Form.Range min={0} max={100} value={soilForm.phosphorus} onChange={(e) => setSoilForm({ ...soilForm, phosphorus: parseInt(e.target.value) })} />
                </Form.Group>
                <Form.Group className="mb-2">
                  <Form.Label>{t('crops.potassium')}: {soilForm.potassium}</Form.Label>
                  <Form.Range min={0} max={100} value={soilForm.potassium} onChange={(e) => setSoilForm({ ...soilForm, potassium: parseInt(e.target.value) })} />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>{t('crops.moisture')}: {soilForm.moisture}%</Form.Label>
                  <Form.Range min={0} max={100} value={soilForm.moisture} onChange={(e) => setSoilForm({ ...soilForm, moisture: parseInt(e.target.value) })} />
                </Form.Group>
                <Button type="submit" className="btn-agri" disabled={saving}>{saving ? t('common.loading') : t('crops.update_soil')}</Button>
              </Form>
            </Col>
            <Col md={6}>
              {soilRadarData.length > 0 && (
                <div className="chart-container">
                  <ResponsiveContainer width="100%" height={250}>
                    <RadarChart data={soilRadarData}>
                      <PolarGrid stroke="var(--border-color)" />
                      <PolarAngleAxis dataKey="metric" tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} />
                      <PolarRadiusAxis tick={false} domain={[0, 100]} />
                      <Radar dataKey="value" stroke="#40916c" fill="#40916c" fillOpacity={0.3} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              )}
              {selectedCrop?.recommendations?.length > 0 && (
                <div className="mt-3">
                  <h6 style={{ color: 'var(--accent-light)' }}>💡 {t('crops.recommendations')}</h6>
                  <ul style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', paddingLeft: '1.2rem' }}>
                    {selectedCrop.recommendations.map((r, i) => <li key={i} className="mb-1">{r}</li>)}
                  </ul>
                </div>
              )}
            </Col>
          </Row>
        </Modal.Body>
      </Modal>
    </div>
  );
}
