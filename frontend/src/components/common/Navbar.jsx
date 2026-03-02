import React from 'react';

const Navbar = ({ title = "Quotation Dashboard", toggleSidebar }) => {
  return (
    <header className="top-navbar bg-white shadow-sm py-2 px-3 border-bottom d-flex align-items-center justify-content-between">
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
            <div className="dropdown w-100" style={{maxWidth: '400px'}}>
                <div className="input-group input-group-sm" id="globalSearchInput" data-bs-toggle="dropdown" aria-expanded="false"
                    data-bs-auto-close="outside">
                    <input type="text" className="form-control bg-light border-0 shadow-none px-3 rounded-pill-start" placeholder="Search..."
                        aria-label="Global Search" />
                    <button className="btn btn-light border-0 rounded-pill-end" type="button">
                        <i className="bi bi-search text-muted"></i>
                    </button>
                </div>
                <ul className="dropdown-menu shadow border-0 mt-2" aria-labelledby="globalSearchInput">
                    <li className="dropdown-header">Recent Searches</li>
                    <li><a className="dropdown-item py-2" href="#"><i className="bi bi-file-earmark-text me-2"></i> Q-001 (Alpha Corp)</a></li>
                    <li><a className="dropdown-item py-2" href="#"><i className="bi bi-person-lines-fill me-2"></i> Client: Tech Innovations</a></li>
                    <li><hr className="dropdown-divider" /></li>
                    <li><a className="dropdown-item text-center small text-primary fw-bold" href="#">View All Results</a></li>
                </ul>
            </div>
        </div>

        <div className="d-flex align-items-center gap-2 gap-md-3">
            <div className="dropdown">
                <a href="#" className="nav-link p-1 position-relative" id="notificationDropdown"
                    data-bs-toggle="dropdown" aria-expanded="false">
                    <i className="bi bi-bell fs-5"></i>
                    <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger" style={{fontSize: '0.55em'}}>3</span>
                </a>
                <ul className="dropdown-menu dropdown-menu-end shadow border-0 mt-2" aria-labelledby="notificationDropdown">
                    <li className="dropdown-header fw-bold">Notifications</li>
                    <li><a className="dropdown-item small" href="#">Quotation Q-001 Approved</a></li>
                </ul>
            </div>
            <a href="#" className="nav-link p-1 d-none d-md-block"><i className="bi bi-gear fs-5"></i></a>
            <img src="https://i.pravatar.cc/32" alt="User" className="rounded-circle border" style={{width: '32px', height: '32px'}} />
        </div>
    </header>
  );
};

export default Navbar;
