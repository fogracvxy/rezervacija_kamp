import React, { useState } from "react";
import { Nav, Navbar, Container } from "react-bootstrap";
import { NavLink as RouterNavLink } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import LogoutButton from "./logoutbutton";
import LoginButton from "./loginbutton";

const Navig = () => {
  //const za pohranu podataka za zatvaranje mobilne navigacije
  const [expanded, setExpanded] = useState(false);
  const Navigacija = () => {
    return (
      <Nav className="mr-auto">
        <Nav.Link
          onClick={() => setExpanded(false)}
          as={RouterNavLink}
          to="/"
          exact
          activeClassName="router-link-exact-active"
        >
          Početna
        </Nav.Link>
        <Nav.Link
          onClick={() => setExpanded(false)}
          as={RouterNavLink}
          to="/rezervacija"
          exact
          activeClassName="router-link-exact-active"
        >
          Rezervacija
        </Nav.Link>
        <Nav.Link
          onClick={() => setExpanded(false)}
          as={RouterNavLink}
          to={{ pathname: "https://robinzonlucica.hr/" }}
          target="_blank"
          activeClassName="router-link-exact-active"
        >
          Web
        </Nav.Link>
      </Nav>
    );
  };
  const NavigacijaAuth = () => {
    const { isAuthenticated } = useAuth0();
    return (
      <Nav>
        {isAuthenticated && (
          // onClick setExpanded kako bi zatvorili navigaciju
          <Nav.Link
            onClick={() => setExpanded(false)}
            as={RouterNavLink}
            to="/rezervacijaadmin"
            exact
            activeClassName="router-link-exact-active"
          >
            Admin
          </Nav.Link>
        )}
        <div className="justify-content-center">
          {isAuthenticated ? <LogoutButton /> : <LoginButton />}
        </div>
      </Nav>
    );
  };
  return (
    <div>
      <Navbar expanded={expanded} collapseOnSelect bg="light" expand="lg">
        <Container>
          <Navbar.Brand as={RouterNavLink} className="logo" to="/" />
          <Navbar.Toggle
            onClick={() => setExpanded(expanded ? false : "expanded")}
            aria-controls="responsive-navbar-nav"
          />
          <Navbar.Collapse id="responsive-navbar-nav">
            <Navigacija />
            <NavigacijaAuth />
          </Navbar.Collapse>
        </Container>
      </Navbar>
    </div>
  );
};

export default Navig;
