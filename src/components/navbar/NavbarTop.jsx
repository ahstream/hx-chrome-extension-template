import React from 'react';
import { Container, Nav, Navbar } from 'react-bootstrap';
import './Navbar.scss';

// import logo from '@images/logos/site-logo10.png';

export default function NavbarTop() {
  return (
    <Navbar expand="lg" className="navbar-top">
      <Container className="navbar-top d-flex justify-content-between">
        <Navbar.Text className="navbar-text-title">CHROME EXTENSION NAVBAR</Navbar.Text>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav" className="justify-content-end float-right">
          <Nav className="right">
            <NavLink to="/foo">Foo</NavLink>
            <NavLink to="/bar">Bar</NavLink>
            <NavLink to="/options.html">Options</NavLink>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

function NavLink({ children, to, ...props }) {
  return (
    <Nav.Link to={to} {...props}>
      {children}
    </Nav.Link>
  );
}
