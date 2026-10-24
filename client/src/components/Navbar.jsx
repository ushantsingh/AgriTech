import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Navbar as BSNavbar, Nav, Container, NavDropdown } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { FiShoppingCart, FiLogOut, FiUser, FiShield } from 'react-icons/fi';
import { GiWheat } from 'react-icons/gi';

export default function AppNavbar({ cartCount }) {
  const { t, i18n } = useTranslation();
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const changeLang = (lng) => i18n.changeLanguage(lng);

  return (
    <BSNavbar expand="lg" fixed="top" className="navbar-agri">
      <Container>
        <BSNavbar.Brand as={Link} to="/">
          <GiWheat style={{ marginRight: 8, fontSize: '1.5rem' }} />
          {t('app_name')}
        </BSNavbar.Brand>
        <BSNavbar.Toggle aria-controls="main-nav" />
        <BSNavbar.Collapse id="main-nav">
          {user ? (
            <>
              <Nav className="me-auto">
                <Nav.Link as={NavLink} to="/dashboard">{t('nav.dashboard')}</Nav.Link>
                <Nav.Link as={NavLink} to="/farms">{t('nav.farms')}</Nav.Link>
                <Nav.Link as={NavLink} to="/crops">{t('nav.crops')}</Nav.Link>
                <Nav.Link as={NavLink} to="/weather">{t('nav.weather')}</Nav.Link>
                <Nav.Link as={NavLink} to="/marketplace">{t('nav.marketplace')}</Nav.Link>
                <Nav.Link as={NavLink} to="/forum">{t('nav.forum')}</Nav.Link>
                {isAdmin && (
                  <Nav.Link as={NavLink} to="/admin" style={{ color: '#e9c46a' }}>
                    <FiShield size={14} style={{ marginRight: 4 }} />
                    {t('nav.admin')}
                  </Nav.Link>
                )}
              </Nav>
              <Nav className="align-items-center">
                {/* Language Toggle */}
                <div className="lang-toggle me-3">
                  <button className={`lang-btn ${i18n.language === 'en' ? 'active' : ''}`} onClick={() => changeLang('en')}>EN</button>
                  <button className={`lang-btn ${i18n.language === 'hi' ? 'active' : ''}`} onClick={() => changeLang('hi')}>हिं</button>
                </div>

                <Nav.Link as={NavLink} to="/cart" className="position-relative me-2">
                  <FiShoppingCart size={18} />
                  {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
                </Nav.Link>

                <NavDropdown title={<><FiUser size={14} /> {user.name?.split(' ')[0]}</>} align="end">
                  <NavDropdown.Item as={Link} to="/orders">{t('nav.orders')}</NavDropdown.Item>
                  <NavDropdown.Divider />
                  <NavDropdown.Item onClick={handleLogout}>
                    <FiLogOut size={14} style={{ marginRight: 6 }} />{t('nav.logout')}
                  </NavDropdown.Item>
                </NavDropdown>
              </Nav>
            </>
          ) : (
            <Nav className="ms-auto align-items-center">
              <div className="lang-toggle me-3">
                <button className={`lang-btn ${i18n.language === 'en' ? 'active' : ''}`} onClick={() => changeLang('en')}>EN</button>
                <button className={`lang-btn ${i18n.language === 'hi' ? 'active' : ''}`} onClick={() => changeLang('hi')}>हिं</button>
              </div>
              <Nav.Link as={NavLink} to="/login">{t('nav.login')}</Nav.Link>
              <Nav.Link as={NavLink} to="/register" className="btn-agri ms-2" style={{ color: 'white' }}>{t('nav.register')}</Nav.Link>
            </Nav>
          )}
        </BSNavbar.Collapse>
      </Container>
    </BSNavbar>
  );
}
