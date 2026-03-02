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
    <div className="d-flex min-vh-100">
      {/* Passing state and toggle to Sidebar */}
      <Sidebar isActive={isSidebarActive} toggleSidebar={toggleSidebar} />
      
      <main className={`main-content ${isSidebarActive ? 'active' : ''}`}>
        {/* Passing toggle to Navbar for the hamburger button */}
        <Navbar toggleSidebar={toggleSidebar} />
        <div className="container-fluid">
          <Outlet />
        </div>
      </main>

      {/* Mobile Overlay */}
      {isSidebarActive && (
        <div 
          className="sidebar-overlay d-md-none" 
          onClick={toggleSidebar}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: 'rgba(0,0,0,0.5)',
            zIndex: 1040
          }}
        ></div>
      )}
    </div>
  );
};

export default Layout;
