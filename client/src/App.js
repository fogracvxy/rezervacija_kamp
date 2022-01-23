import { Container } from "react-bootstrap";
import "./App.css";
import { Route, Switch, Redirect } from "react-router-dom";
import {
  Pocetna,
  Footer,
  Rezervacija,
  RezervacijaAdmin,
  ErrorPage,
} from "./views";
import { Meta } from "./components";
import { Navig, Loading } from "./components/index";
import ProtectedRoute from "./auth/protectedroute";
import { useAuth0 } from "@auth0/auth0-react";
import CookieConsent from "react-cookie-consent";
import ScrollToTop from "react-scroll-up";
import { FiArrowUpCircle } from "react-icons/fi";
function App() {
  const { isLoading } = useAuth0();
  if (isLoading) {
    return <Loading />;
  }
  return (
    <div className="App">
      <Meta />
      <Navig />
      <Container className="flex-grow-1 mt-5">
        <Switch>
          <Route path="/" exact component={Pocetna} />
          <Route path="/rezervacija" component={Rezervacija} />
          <ProtectedRoute
            path="/rezervacijaadmin"
            component={RezervacijaAdmin}
          />
          <Route path="/404" component={ErrorPage} />
          <Redirect to="/404" />
        </Switch>
      </Container>
      <Footer />
      <CookieConsent buttonText="Slažem se!">
        Kolačiće koristimo kako bismo osigurali da vam pružimo najbolje iskustvo
        na našoj web stranici. Ako nastavite koristiti ovu stranicu,
        pretpostavit ćemo da ste zadovoljni.
      </CookieConsent>
      <ScrollToTop showUnder={160}>
        <FiArrowUpCircle size={30} />
      </ScrollToTop>
    </div>
  );
}

export default App;
