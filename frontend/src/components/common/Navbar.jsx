import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const Navbar = ({ title = "Quotation Dashboard", toggleSidebar }) => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [userInfo, setUserInfo] = useState({
    name: 'Admin User',
    email: 'admin@example.com',
    avatar: null
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch notifications (recent quotations)
        const quotRes = await axios.get('/api/quotations');
        const recent = quotRes.data.slice(-5).reverse();
        setNotifications(recent.map(q => ({
          id: q.id,
          text: `New Quotation ${q.id} for ${q.clientName}`,
          time: q.dateCreated,
          link: `/view-quotation/${q.id}`
        })));

        // Fetch user info (assuming first user is the logged-in one for this demo)
        const userRes = await axios.get('/api/users');
        if (userRes.data && userRes.data.length > 0) {
          setUserInfo(userRes.data[0]);
        }
      } catch (error) {
        console.error("Error fetching navbar data:", error);
      }
    };
    fetchData();
  }, []);

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      localStorage.clear();
      sessionStorage.clear();
      navigate('/client-login');
    }
  };

  return (
    <header className="top-navbar bg-white shadow-sm py-2 px-3 border-bottom d-flex align-items-center justify-content-between position-relative" style={{ zIndex: 1030 }}>
        <div className="d-flex align-items-center">
            {/* Hamburger Button for Mobile */}
            <button 
                className="btn btn-link text-dark p-0 me-3 d-md-none border-0 shadow-none" 
                onClick={toggleSidebar}
            >
                <i className="bi bi-list fs-2"></i>
            </button>
            <h5 className="mb-0 fw-bold d-none d-sm-block">{title}</h5>
        </div>

        <div className="d-flex align-items-center flex-grow-1 mx-2 mx-md-4">
            <div className="dropdown w-100">
                <div className="input-group" id="globalSearchInput" data-bs-toggle="dropdown" aria-expanded="false"
                    data-bs-auto-close="outside">
                    <input type="text" className="form-control bg-light border-0 shadow-none px-3 rounded-pill-start" placeholder="Search..."
                        aria-label="Global Search" />
                    <button className="btn btn-light border-0 rounded-pill-end" type="button">
                        <i className="bi bi-search text-muted"></i>
                    </button>
                </div>
                <ul className="dropdown-menu shadow border-0 mt-2 w-100" aria-labelledby="globalSearchInput">
                    <li className="dropdown-header">Recent Searches</li>
                    <li><a className="dropdown-item py-2" href="#"><i className="bi bi-file-earmark-text me-2"></i> Q-001 (Alpha Corp)</a></li>
                    <li><a className="dropdown-item py-2" href="#"><i className="bi bi-person-lines-fill me-2"></i> Client: Tech Innovations</a></li>
                    <li><hr className="dropdown-divider" /></li>
                    <li><a className="dropdown-item text-center small text-primary fw-bold" href="#">View All Results</a></li>
                </ul>
            </div>
        </div>

        <div className="d-flex align-items-center gap-2 gap-md-3">
            {/* Notifications */}
            <div className="dropdown">
                <button 
                    className="btn btn-link nav-link p-1 position-relative border-0 shadow-none" 
                    id="notificationDropdown"
                    data-bs-toggle="dropdown" 
                    aria-expanded="false"
                >
                    <i className="bi bi-bell fs-5"></i>
                    {notifications.length > 0 && (
                      <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger" style={{fontSize: '0.55em'}}>
                        {notifications.length}
                      </span>
                    )}
                </button>
                <ul className="dropdown-menu dropdown-menu-end shadow border-0 mt-2 py-0 overflow-hidden" aria-labelledby="notificationDropdown" style={{ width: '300px' }}>
                    <li className="dropdown-header fw-bold bg-light py-2">Notifications</li>
                    <div style={{ maxHeight: '350px', overflowY: 'auto' }}>
                      {notifications.length > 0 ? notifications.map((n, i) => (
                        <li key={i}>
                          <Link className="dropdown-item small py-2 border-bottom" to={n.link}>
                            <div className="fw-bold">{n.text}</div>
                            <div className="text-muted" style={{fontSize: '0.8em'}}>{n.time}</div>
                          </Link>
                        </li>
                      )) : (
                        <li className="p-3 text-center text-muted small">No new notifications</li>
                      )}
                    </div>
                    <li><Link className="dropdown-item text-center small text-primary fw-bold py-2" to="/all-quotations">View All Activity</Link></li>
                </ul>
            </div>

            {/* Settings */}
            <Link to="/settings" className="nav-link p-1 d-none d-md-block text-dark">
              <i className="bi bi-gear fs-5"></i>
            </Link>

            {/* Profile */}
            <div className="dropdown">
                <button 
                  className="btn btn-link p-0 border-0 shadow-none dropdown-toggle no-caret" 
                  id="profileDropdown"
                  data-bs-toggle="dropdown" 
                  aria-expanded="false"
                >
                  <div className="rounded-circle border bg-primary bg-opacity-10 d-flex align-items-center justify-content-center overflow-hidden" style={{width: '32px', height: '32px'}}>
                    {userInfo.avatar ? (
                      <img src={userInfo.avatar} alt="User" className="w-100 h-100 object-fit-cover" />
                    ) : (
                      <span className="fw-bold text-primary" style={{fontSize: '0.8rem'}}>{userInfo.name?.charAt(0) || 'A'}</span>
                    )}
                  </div>
                </button>
                <ul className="dropdown-menu dropdown-menu-end shadow border-0 mt-2" aria-labelledby="profileDropdown">
                    <li className="px-3 py-2 border-bottom mb-1">
                      <div className="fw-bold small">{userInfo.name}</div>
                      <div className="text-muted small" style={{fontSize: '0.8em'}}>{userInfo.email}</div>
                    </li>
                    <li><Link className="dropdown-item py-2" to="/settings?tab=profile"><i className="bi bi-person me-2"></i> My Profile</Link></li>
                    <li><Link className="dropdown-item py-2" to="/settings"><i className="bi bi-gear me-2"></i> Settings</Link></li>
                    <li><hr className="dropdown-divider" /></li>
                    <li><button className="dropdown-item py-2 text-danger fw-bold" onClick={handleLogout}><i className="bi bi-box-arrow-right me-2"></i> Logout</button></li>
                </ul>
            </div>
        </div>
        <style dangerouslySetInnerHTML={{ __html: `
          .no-caret::after { display: none !important; }
        `}} />
    </header>
  );
};

export default Navbar;
