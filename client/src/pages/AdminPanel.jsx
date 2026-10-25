import { useState, useEffect } from 'react';
import { Row, Col, Card, Button, Spinner, Badge, Form, Tab, Tabs } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import api from '../../services/api';
import { toast } from 'react-toastify';
import { FiUsers, FiPackage, FiDollarSign, FiCheckCircle, FiTrash2, FiAlertCircle } from 'react-icons/fi';

const COLORS = ['#40916c', '#e9c46a', '#29b6f6', '#ef5350', '#66bb6a', '#d4a373'];

export default function AdminPanel() {
  const { t } = useTranslation();
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [pendingRes, setPendingRes] = useState([]);
  const [orders, setOrders] = useState([]);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('stats');

  const loadAll = async () => {
    setLoading(true);
    try {
      const [statsRes, usersRes, pendingResRes, ordersRes, postsRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/users'),
        api.get('/admin/resources/pending'),
        api.get('/admin/orders'),
        api.get('/forum'),
      ]);
      setStats(statsRes.data);
      setUsers(usersRes.data);
      setPendingRes(pendingResRes.data);
      setOrders(ordersRes.data);
      setPosts(postsRes.data.posts || []);
    } catch (err) {
      toast.error(t('common.error'));
    } finally { setLoading(false); }
  };

  useEffect(() => { loadAll(); }, []);

  const changeRole = async (userId, role) => {
    try {
      await api.put(`/admin/users/${userId}/role`, { role });
      toast.success('Role updated');
      loadAll();
    } catch { toast.error(t('common.error')); }
  };

  const approveResource = async (id) => {
    try {
      await api.put(`/admin/resources/${id}/approve`);
      toast.success('Resource approved');
      loadAll();
    } catch { toast.error(t('common.error')); }
  };

  const updateOrderStatus = async (id, status) => {
    try {
      await api.put(`/admin/orders/${id}/status`, { status });
      toast.success('Order status updated');
      loadAll();
    } catch { toast.error(t('common.error')); }
  };

  const deletePost = async (id) => {
    if (!window.confirm('Delete this post?')) return;
    try {
      await api.delete(`/admin/forum/${id}`);
      toast.success('Post deleted');
      loadAll();
    } catch { toast.error(t('common.error')); }
  };

  if (loading) return <div className="spinner-wrapper"><Spinner animation="border" variant="success" /></div>;

  const statCards = stats ? [
    { icon: <FiUsers />, value: stats.users, label: t('admin.total_users'), color: 'var(--primary-light)' },
    { icon: <FiDollarSign />, value: `₹${stats.revenue}`, label: t('admin.total_revenue'), color: 'var(--accent-light)' },
    { icon: <FiPackage />, value: stats.orders, label: t('admin.orders'), color: 'var(--info)' },
    { icon: <FiAlertCircle />, value: stats.pendingResources, label: t('admin.pending_approvals'), color: 'var(--warning)' },
  ] : [];

  const pieData = stats ? [
    { name: 'Users', value: stats.users },
    { name: 'Farms', value: stats.farms },
    { name: 'Crops', value: stats.crops },
    { name: 'Resources', value: stats.resources },
    { name: 'Orders', value: stats.orders },
    { name: 'Posts', value: stats.posts },
  ] : [];

  return (
    <div className="page-container animate-in" style={{ paddingTop: '5rem' }}>
      <div className="page-header">
        <h1>🛡️ {t('admin.title')}</h1>
      </div>

      <Tabs activeKey={tab} onSelect={(k) => setTab(k)} className="mb-4"
        style={{ borderBottom: '1px solid var(--border-color)' }}>
        <Tab eventKey="stats" title={t('admin.stats')}>
          <Row className="g-3 mb-4 mt-2">
            {statCards.map((s, i) => (
              <Col sm={6} lg={3} key={i}>
                <div className="stat-card">
                  <div className="stat-icon" style={{ color: s.color, background: `${s.color}20` }}>{s.icon}</div>
                  <div className="stat-value">{s.value}</div>
                  <div className="stat-label">{s.label}</div>
                </div>
              </Col>
            ))}
          </Row>
          {pieData.length > 0 && (
            <Card className="card-agri" style={{ padding: '1.5rem' }}>
              <h6 style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>System Overview</h6>
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={3} dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}>
                    {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 8 }} />
                </PieChart>
              </ResponsiveContainer>
            </Card>
          )}
        </Tab>

        <Tab eventKey="users" title={t('admin.users')}>
          <div className="table-responsive mt-2">
            <table className="table table-agri">
              <thead>
                <tr><th>Name</th><th>Email</th><th>Role</th><th>Joined</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u._id}>
                    <td style={{ fontWeight: 500 }}>{u.name}</td>
                    <td style={{ color: 'var(--text-muted)' }}>{u.email}</td>
                    <td>
                      <Badge bg={u.role === 'admin' ? 'warning' : 'success'}>{u.role}</Badge>
                    </td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                    <td>
                      <Form.Select size="sm" value={u.role} onChange={(e) => changeRole(u._id, e.target.value)}
                        style={{ width: 120, display: 'inline-block' }}>
                        <option value="farmer">Farmer</option>
                        <option value="admin">Admin</option>
                      </Form.Select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Tab>

        <Tab eventKey="resources" title={<>{t('admin.resources')} {pendingRes.length > 0 && <Badge bg="warning" className="ms-1">{pendingRes.length}</Badge>}</>}>
          <div className="mt-2">
            {pendingRes.length === 0 ? (
              <Card className="card-agri text-center p-4">
                <p style={{ color: 'var(--text-muted)' }}>No pending resources</p>
              </Card>
            ) : (
              pendingRes.map((r) => (
                <Card key={r._id} className="card-agri mb-2" style={{ padding: '1rem' }}>
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <h6 style={{ margin: 0, color: 'var(--text-primary)' }}>{r.name}</h6>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        {r.category} · ₹{r.price} · by {r.createdBy?.name || 'Unknown'}
                      </span>
                    </div>
                    <Button size="sm" className="btn-agri" onClick={() => approveResource(r._id)}>
                      <FiCheckCircle className="me-1" /> {t('admin.approve')}
                    </Button>
                  </div>
                </Card>
              ))
            )}
          </div>
        </Tab>

        <Tab eventKey="orders" title={t('admin.orders')}>
          <div className="table-responsive mt-2">
            <table className="table table-agri">
              <thead>
                <tr><th>Order ID</th><th>User</th><th>Total</th><th>Status</th><th>Date</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={o._id}>
                    <td style={{ fontWeight: 500, fontSize: '0.85rem' }}>#{o._id.slice(-8)}</td>
                    <td>{o.user?.name || '-'}</td>
                    <td style={{ color: 'var(--accent-light)', fontWeight: 600 }}>₹{o.totalAmount}</td>
                    <td><span className={`badge-status badge-${o.status}`}>{o.status}</span></td>
                    <td style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      {new Date(o.createdAt).toLocaleDateString()}
                    </td>
                    <td>
                      <Form.Select size="sm" value={o.status} onChange={(e) => updateOrderStatus(o._id, e.target.value)}
                        style={{ width: 130, display: 'inline-block' }}>
                        {['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'].map(s =>
                          <option key={s} value={s}>{s}</option>
                        )}
                      </Form.Select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Tab>

        <Tab eventKey="forum" title={t('admin.forum')}>
          <div className="mt-2">
            {posts.length === 0 ? (
              <Card className="card-agri text-center p-4">
                <p style={{ color: 'var(--text-muted)' }}>No forum posts</p>
              </Card>
            ) : (
              posts.map((p) => (
                <Card key={p._id} className="card-agri mb-2" style={{ padding: '1rem' }}>
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <h6 style={{ margin: 0, color: 'var(--text-primary)' }}>{p.title}</h6>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        By {p.author?.name || 'Unknown'} · {p.category} · {p.comments?.length || 0} comments
                      </span>
                    </div>
                    <Button size="sm" variant="link" style={{ color: 'var(--danger)' }} onClick={() => deletePost(p._id)}>
                      <FiTrash2 /> Delete
                    </Button>
                  </div>
                </Card>
              ))
            )}
          </div>
        </Tab>
      </Tabs>
    </div>
  );
}
