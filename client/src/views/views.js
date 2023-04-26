import React from "react";
import "./views.css";
import { Route, Routes, Navigate } from "react-router-dom";
import {
  Pocetna,
  Rezervacija,
  RezervacijaAdmin,
  Statistics,
  SignUp,
  LoginPage,
} from "./index.js";
import { Navbartop } from "../components/";
import PrivateRoutes from "../components/privateRoutes";
import { AccountContext } from "../components/AccountContext";
import AdminRoutes from "../components/adminRoutes";
import CookieConsent from "react-cookie-consent";
import ScrollToTop from "react-scroll-up";
import { FiArrowUpCircle } from "react-icons/fi";
import { useContext } from "react";
import UserReservation from "./userReservation";
const Views = () => {
  const { user } = useContext(AccountContext);
  return (
    <div>
      {" "}
      <Navbartop />
      <Routes>
        <Route
          path="/login"
          element={<LoginPage isLoggedIn={user.loggedIn} />}
        />
        <Route
          path="/register"
          element={<SignUp isLoggedIn={user.loggedIn} />}
        />

        <Route element={<PrivateRoutes />}>
          <Route path="/rezervacija" element={<Rezervacija />} />
          <Route path="/rezervacije" element={<UserReservation />} />
          <Route element={<AdminRoutes isAdmin={user.role} />}>
            {" "}
            <Route path="/rezervacijaadmin" element={<RezervacijaAdmin />} />
            <Route path="/stats" element={<Statistics />} />
          </Route>
        </Route>
        <Route path="*" element={<Pocetna />} />
      </Routes>
      <CookieConsent buttonText="Slažem se!">
        Kolačiće koristimo kako bismo osigurali da vam pružimo najbolje iskustvo
        na našoj web stranici. Ako nastavite koristiti ovu stranicu,
        pretpostavit ćemo da ste zadovoljni.
      </CookieConsent>
      <ScrollToTop smooth showUnder={160}>
        <FiArrowUpCircle style={{ overflow: "999" }} size={30} />
      </ScrollToTop>
    </div>
  );
};

export default Views;
