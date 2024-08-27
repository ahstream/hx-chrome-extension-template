import React from 'react';
import Container from 'react-bootstrap/Container';
import NavbarTop from '@components/navbar/NavbarTop.jsx';

export default function PageLayout({ pageTitle, children }) {
  return (
    <div className="page-container">
      <NavbarTop />
      <div className="main-container">
        <Container className="main-content-container">
          <h1 className="page-title">{pageTitle}</h1>
          {children}
        </Container>
      </div>
    </div>
  );
}
