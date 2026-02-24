import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

const Layout = () => {
  return (
    <div className="d-flex min-vh-100">
      <Sidebar />
      <main className="main-content">
        <Navbar />
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
