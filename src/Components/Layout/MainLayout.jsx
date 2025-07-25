// src/components/Layout/MainLayout.jsx
import React from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import './Layout.scss';

const MainLayout = ({ children }) => {
  return (
    <div className="app-container">
      <Header />
      <div className="main-content">
        <Sidebar />
        <div className="content-wrapper">
          {children}
        </div>
      </div>
    </div>
  );
};

export default MainLayout;