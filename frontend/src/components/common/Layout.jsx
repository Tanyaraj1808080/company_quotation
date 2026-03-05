import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

const Layout = () => {
  const [isSidebarActive, setIsSidebarActive] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarActive(!isSidebarActive);
  };

  return (
    <div className="layout-wrapper min-vh-100">
      <Sidebar isActive={isSidebarActive} toggleSidebar={toggleSidebar} />
      
      <main className={`main-content ${isSidebarActive ? 'active' : ''}`}>
        <Navbar toggleSidebar={toggleSidebar} />
        
        <div className="container-fluid px-0 px-md-4 py-4">
          <Outlet />
        </div>
      </main>

      {/* Backdrop for mobile/tablet (< 992px) */}
      {isSidebarActive && (
        <div 
          className="sidebar-backdrop d-lg-none"
          onClick={toggleSidebar}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: 'rgba(15, 23, 42, 0.5)',
            backdropFilter: 'blur(4px)',
            zIndex: 1045,
            cursor: 'pointer'
          }}
        ></div>
      )}
    </div>
  );
};

export default Layout;
