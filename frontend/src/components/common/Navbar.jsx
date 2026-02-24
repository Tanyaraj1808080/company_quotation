import React from 'react';

const Navbar = ({ title = "Quotation Dashboard" }) => {
  return (
    <header className="top-navbar">
        <div className="d-flex align-items-center">
            <h5 className="mb-0">{title}</h5>
        </div>
        <div className="d-flex align-items-center flex-grow-1 mx-4">
            <div className="dropdown w-100">
                <div className="input-group" id="globalSearchInput" data-bs-toggle="dropdown" aria-expanded="false"
                    data-bs-auto-close="outside">
                    <input type="text" className="form-control" placeholder="Search across modules..."
                        aria-label="Global Search" />
                    <button className="btn btn-outline-secondary" type="button"><i
                            className="bi bi-search"></i></button>
                </div>
                <ul className="dropdown-menu" aria-labelledby="globalSearchInput">
                    <li className="dropdown-header">Recent Searches</li>
                    <li><a className="dropdown-item" href="#"><i className="bi bi-file-earmark-text me-2"></i> Quotation
                            Q-001 (Alpha Corp)</a></li>
                    <li><a className="dropdown-item" href="#"><i className="bi bi-person-lines-fill me-2"></i> Client:
                            Tech Innovations Inc.</a></li>
                    <li><a className="dropdown-item" href="#"><i className="bi bi-person-plus me-2"></i> Lead: John
                            Doe</a></li>
                    <li>
                        <hr className="dropdown-divider" />
                    </li>
                    <li className="dropdown-header">Search Results (Mock)</li>
                    <li><a className="dropdown-item" href="#"><i className="bi bi-file-earmark-text me-2"></i> Q-002:
                            Beta Ltd. - Pending</a></li>
                    <li><a className="dropdown-item" href="#"><i className="bi bi-briefcase me-2"></i> Opportunity:
                            Mobile App Dev.</a></li>
                    <li><a className="dropdown-item" href="#"><i className="bi bi-person-lines-fill me-2"></i> Client:
                            Global Solutions Ltd.</a></li>
                    <li>
                        <hr className="dropdown-divider" />
                    </li>
                    <li><a className="dropdown-item text-center" href="#">View All Results</a></li>
                </ul>
            </div>
            <div className="dropdown">
                <a href="#" className="nav-link me-3 position-relative" id="notificationDropdown"
                    data-bs-toggle="dropdown" aria-expanded="false">
                    <i className="bi bi-bell-fill fs-5"></i>
                    <span
                        className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger"
                        style={{fontSize: '0.6em'}}>
                        3
                        <span className="visually-hidden">unread notifications</span>
                    </span>
                </a>
                <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="notificationDropdown">
                    <li className="dropdown-header">You have 3 new notifications</li>
                    <li>
                        <hr className="dropdown-divider" />
                    </li>
                    <li>
                        <a className="dropdown-item d-flex align-items-center" href="#">
                            <i className="bi bi-check-circle-fill text-success me-2"></i>
                            <div>
                                <p className="mb-0">Quotation Q-001 Approved</p>
                                <small className="text-muted">15 minutes ago</small>
                            </div>
                        </a>
                    </li>
                    <li>
                        <hr className="dropdown-divider" />
                    </li>
                    <li>
                        <a className="dropdown-item d-flex align-items-center" href="#">
                            <i className="bi bi-person-plus-fill text-primary me-2"></i>
                            <div>
                                <p className="mb-0">New Lead Assigned</p>
                                <small className="text-muted">1 hour ago</small>
                            </div>
                        </a>
                    </li>
                    <li>
                        <hr className="dropdown-divider" />
                    </li>
                    <li>
                        <a className="dropdown-item d-flex align-items-center" href="#">
                            <i className="bi bi-exclamation-triangle-fill text-warning me-2"></i>
                            <div>
                                <p className="mb-0">Task "Prepare Proposal" is overdue</p>
                                <small className="text-muted">3 hours ago</small>
                            </div>
                        </a>
                    </li>
                    <li>
                        <hr className="dropdown-divider" />
                    </li>
                    <li><a className="dropdown-item text-center" href="#">View all notifications</a></li>
                </ul>
            </div>
            <a href="#" className="nav-link me-3"><i className="bi bi-gear-fill"></i></a>
            <a href="#" className="nav-link">
                <img src="https://i.pravatar.cc/40" alt="User" className="rounded-circle" />
            </a>
            <a href="#" className="nav-link ms-3" id="navbar-logout-link">
                <i className="bi bi-box-arrow-right"></i>
            </a>
        </div>
    </header>
  );
};

export default Navbar;
