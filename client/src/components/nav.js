import React, { useState } from "react";
import { Nav, Navbar, Container } from "react-bootstrap";
import { NavLink } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import LogoutButton from "./logoutbutton";
import LoginButton from "./loginbutton";

const Navig = () => {
  //const za pohranu podataka za zatvaranje mobilne navigacije
  const [expanded, setExpanded] = useState(false);
  const Navigacija = () => {
    return (
      <Nav className="mr-auto">
        <NavLink
          onClick={() => setExpanded(false)}
          to="/"
          className={(navData) =>
            navData.isActive ? "nav-link router-link-exact-active" : "nav-link"
          }
        >
          Početna
        </NavLink>
        <NavLink
          onClick={() => setExpanded(false)}
          to="/rezervacija"
          className={(navData) =>
            navData.isActive ? "nav-link router-link-exact-active" : "nav-link"
          }
        >
          Rezervacija
        </NavLink>
        <a
          style={{ textDecoration: "none", color: "black" }}
          className="mt-2"
          href="https://robinzonlucica.hr/"
          rel="noreferrer"
          target="_blank"
        >
          Web
        </a>
      </Nav>
    );
  };
  const NavigacijaAuth = () => {
    const { isAuthenticated } = useAuth0();
    return (
      <Nav>
        {isAuthenticated && (
          <>
            <NavLink
              className={(navData) =>
                navData.isActive
                  ? "nav-link router-link-exact-active"
                  : "nav-link"
              }
              onClick={() => setExpanded(false)}
              to="/stats"
              exact
            >
              Stats
            </NavLink>

            <NavLink
              className={(navData) =>
                navData.isActive
                  ? "nav-link router-link-exact-active"
                  : "nav-link"
              }
              onClick={() => setExpanded(false)}
              to="/rezervacijaadmin"
              exact
            >
              Admin
            </NavLink>
          </>
        )}
        <div className="justify-content-center">
          {isAuthenticated ? <LogoutButton /> : <LoginButton />}
        </div>
      </Nav>
    );
  };
  return (
    <div>
      <Navbar className="navigacija_sve" expanded={expanded} collapseOnSelect bg="light" expand="lg">
        <Container>
          <Navbar.Brand as={NavLink} className="logo" to="/" />
          <Navbar.Toggle
            onClick={() => setExpanded(expanded ? false : "expanded")}
            aria-controls="responsive-navbar-nav"
          />
          <Navbar.Collapse id="responsive-navbar-nav">
            <Navigacija />
            <NavigacijaAuth  className="navigacija_auth"/>
          </Navbar.Collapse>
        </Container>
      </Navbar>
    </div>
  );
};

export default Navig;
