const express = require("express");
const cors = require("cors");
const app = express();
const path = require("path");
const pool = require("./db");
const PORT = process.env.PORT || 3001;
//middleware
app.use(express.json());
app.use(cors());
app.use(express.static(path.join(__dirname, "client/build")));
//rute
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "client/build")));
}
//čitanje rezervacija
app.get("/rezervacijelista", async (req, res) => {
  try {
    const sveRezervacije = await pool.query(
      "SELECT *, lower(reservation_dates) as t_start, upper(reservation_dates) AS t_end FROM reservations"
    );
    res.json(sveRezervacije.rows);
  } catch (err) {
    console.error(err.message);
  }
});
//brisanje rezervacija
app.delete("/rezervacijadelete/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query("DELETE FROM reservations WHERE id = $1", [id]);
    res.json("Rezervacija obrisana");
  } catch (err) {
    res.json("Greška kod brisanja");
  }
});
app.put("/rezervacijaodobri/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query("UPDATE reservations SET odobreno = true WHERE id = $1", [
      id,
    ]);
    res.json("Rezervacija odobrena");
  } catch (err) {
    res.json("Greška kod odobrenja");
  }
});
//citanje smjestaja
app.get("/smjestaj", async (req, res) => {
  try {
    const sveSobe = await pool.query("SELECT * from rooms");
    res.json(sveSobe.rows);
  } catch (err) {
    console.error(err.message);
  }
});
//umetanje rezervacije
app.post("/rezervirajtermin", async (req, res) => {
  try {
    console.log(req.body);
    const {
      mailGosta,
      pocetniDatum,
      krajniDatum,
      smjestajIme,
      imeGosta,
      brojGosta,
    } = req.body;
    await pool.query(
      "INSERT INTO reservations(reservation_dates,room_id,user_mail, user_name ,user_phone) VALUES(tstzrange($1, $2, '[)'),$3, $4, $5, $6)",
      [pocetniDatum, krajniDatum, smjestajIme, mailGosta, imeGosta, brojGosta]
    );
    res.json("Uspješna rezervacija");
  } catch (err) {
    res.json("Neuspješna rezervacija");
  }
});
app.post("/rezerviranidatumi", async (req, res) => {
  try {
    const { smjestajIme } = req.body;
    const rezerviraniDatumi = await pool.query(
      "SELECT *, lower(reservation_dates) as t_start, upper(reservation_dates) AS t_end FROM reservations WHERE room_id = $1 AND odobreno = true",
      [smjestajIme]
    );
    res.json(rezerviraniDatumi.rows);
  } catch (err) {
    console.error(err.message);
  }
});
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "client/build/index.html"));
});
//listen na portu 3001
app.listen(PORT, () => {
  console.log(`Server je pokrenut na portu ${PORT}`);
});
