import { useState, useEffect } from 'react';
import { Row, Col, Card, Button, Modal, Form, Spinner, Badge } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { toast } from 'react-toastify';
import { FiPlus, FiTrash2, FiMessageSquare, FiSend } from 'react-icons/fi';

const forumCategories = ['general', 'crops', 'pest-control', 'equipment', 'consultation', 'market-prices'];

export default function Forum() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ title: '', content: '', category: 'general' });
  const [saving, setSaving] = useState(false);
  const [expandedPost, setExpandedPost] = useState(null);
  const [comment, setComment] = useState('');
  const [filterCat, setFilterCat] = useState('');

  const load = async () => {
    try {
      const url = filterCat ? `/forum?category=${filterCat}` : '/forum';
      const { data } = await api.get(url);
      setPosts(data.posts || []);
    } catch { toast.error(t('common.error')); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [filterCat]);

  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/forum', form);
      toast.success('Post created');
      setShowModal(false);
      setForm({ title: '', content: '', category: 'general' });
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || t('common.error'));
    } finally { setSaving(false); }
  };

  const handleComment = async (postId) => {
    if (!comment.trim()) return;
    try {
      await api.post(`/forum/${postId}/comments`, { content: comment });
      setComment('');
      toast.success('Comment added');
      load();
    } catch { toast.error(t('common.error')); }
  };

  const handleDelete = async (postId) => {
    if (!window.confirm('Delete this post?')) return;
    try {
      await api.delete(`/forum/${postId}`);
      toast.success('Post deleted');
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || t('common.error'));
    }
  };

  if (loading) return <div className="spinner-wrapper"><Spinner animation="border" variant="success" /></div>;

  return (
    <div className="page-container animate-in" style={{ paddingTop: '5rem' }}>
      <div className="page-header d-flex justify-content-between align-items-center">
        <div><h1>{t('forum.title')}</h1></div>
        {user && (
          <Button className="btn-agri" onClick={() => setShowModal(true)}>
            <FiPlus className="me-1" /> {t('forum.create_post')}
          </Button>
        )}
      </div>

      {/* Category Filter */}
      <div className="d-flex gap-2 mb-4 flex-wrap">
        <Button size="sm" className={!filterCat ? 'btn-agri' : 'btn-agri-outline'} onClick={() => setFilterCat('')}>All</Button>
        {forumCategories.map(cat => (
          <Button key={cat} size="sm" className={filterCat === cat ? 'btn-agri' : 'btn-agri-outline'}
            onClick={() => setFilterCat(cat)} style={{ textTransform: 'capitalize' }}>
            {cat.replace('-', ' ')}
          </Button>
        ))}
      </div>

      {posts.length === 0 ? (
        <Card className="card-agri text-center p-5">
          <FiMessageSquare size={48} style={{ color: 'var(--text-muted)', margin: '0 auto 1rem' }} />
          <p style={{ color: 'var(--text-muted)' }}>{t('forum.no_posts')}</p>
        </Card>
      ) : (
        posts.map((post) => (
          <Card key={post._id} className="card-agri mb-3" style={{ padding: '1.25rem' }}>
            <div className="d-flex justify-content-between">
              <div style={{ flex: 1 }}>
                <div className="d-flex align-items-center gap-2 mb-1">
                  <span style={{ fontSize: '0.7rem', textTransform: 'capitalize', fontWeight: 600, color: 'var(--primary-light)', background: 'rgba(45,106,79,0.15)', padding: '2px 8px', borderRadius: 12 }}>
                    {post.category?.replace('-', ' ')}
                  </span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {new Date(post.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <h5 style={{ color: 'var(--text-primary)', fontWeight: 600, margin: '0.3rem 0' }}>{post.title}</h5>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: 8 }}>
                  By <span style={{ color: 'var(--text-secondary)' }}>{post.author?.name || 'Unknown'}</span>
                  {post.author?.role === 'admin' && <Badge bg="warning" text="dark" className="ms-1" style={{ fontSize: '0.6rem' }}>Admin</Badge>}
                </p>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', whiteSpace: 'pre-line' }}>{post.content}</p>
              </div>
              <div className="d-flex flex-column gap-1">
                {user && (post.author?._id === user._id || user.role === 'admin') && (
                  <Button size="sm" variant="link" style={{ color: 'var(--danger)' }} onClick={() => handleDelete(post._id)}>
                    <FiTrash2 />
                  </Button>
                )}
              </div>
            </div>

            {/* Comments */}
            <div className="mt-2">
              <Button size="sm" variant="link" style={{ color: 'var(--text-muted)', padding: 0 }}
                onClick={() => setExpandedPost(expandedPost === post._id ? null : post._id)}>
                <FiMessageSquare className="me-1" /> {post.comments?.length || 0} {t('forum.comments')}
              </Button>

              {expandedPost === post._id && (
                <div className="mt-2" style={{ paddingLeft: '1rem', borderLeft: '2px solid var(--border-color)' }}>
                  {post.comments?.map((c, i) => (
                    <div key={c._id || i} className="mb-2" style={{ fontSize: '0.85rem' }}>
                      <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>{c.author?.name || 'User'}</span>
                      {c.author?.role === 'admin' && <Badge bg="warning" text="dark" className="ms-1" style={{ fontSize: '0.55rem' }}>Admin</Badge>}
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}> · {new Date(c.createdAt).toLocaleDateString()}</span>
                      <p style={{ margin: '2px 0 0', color: 'var(--text-primary)' }}>{c.content}</p>
                    </div>
                  ))}
                  {user && (
                    <div className="d-flex gap-2 mt-2">
                      <Form.Control size="sm" value={comment} onChange={(e) => setComment(e.target.value)}
                        placeholder={t('forum.add_comment')} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleComment(post._id); } }} />
                      <Button size="sm" className="btn-agri" onClick={() => handleComment(post._id)}><FiSend /></Button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </Card>
        ))
      )}

      {/* New Post Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton><Modal.Title>{t('forum.create_post')}</Modal.Title></Modal.Header>
        <Form onSubmit={handleCreate}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>{t('forum.post_title')}</Form.Label>
              <Form.Control required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>{t('forum.category')}</Form.Label>
              <Form.Select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                {forumCategories.map(c => <option key={c} value={c} style={{ textTransform: 'capitalize' }}>{c.replace('-', ' ')}</option>)}
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>{t('forum.post_content')}</Form.Label>
              <Form.Control as="textarea" rows={5} required value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })} />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>{t('common.cancel')}</Button>
            <Button type="submit" className="btn-agri" disabled={saving}>{saving ? t('common.loading') : 'Post'}</Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
}
