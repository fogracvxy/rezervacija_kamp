const express = require("express");
const cors = require("cors");
const app = express();
const path = require("path");
const pool = require("./db");
const PORT = process.env.PORT || 3001;
const nodemailer = require("nodemailer");
const moment = require("moment");
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

    const getReservations = await pool.query(
      "SELECT *, lower(reservation_dates) as t_start, upper(reservation_dates) AS t_end FROM reservations where id=$1",
      [id]
    );
    let transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST,
      port: process.env.MAIL_PORT,
      secure: false, // upgrade later with STARTTLS
      auth: {
        user: process.env.MAIL_IME,
        pass: process.env.MAIL_PASS,
      },
      tls: {
        // do not fail on invalid certs
        rejectUnauthorized: false,
      },
    });
    transporter.verify(function (error, success) {
      if (error) {
        console.log(error);
      } else {
        console.log("Uspjesno spajanje na mail posluzitelj");
      }
    });
    if (getReservations.rows[0].odobreno) {
      transporter.sendMail(
        {
          from: process.env.MAIL_IME,
          to: getReservations.rows[0].user_mail,
          subject: "Rezervacija Robinzonski kamp Lučica",
          text:
            `Pozdrav ` +
            getReservations.rows[0].user_name +
            `,\n\nrezervacija kreirana na dan ` +
            moment(getReservations.rows[0].created_at).format("DD.MM.YYYY.") +
            ` je odobrena. \n\nRaspon datuma od ` +
            moment(getReservations.rows[0].t_start).format("DD.MM.YYYY.") +
            ` do ` +
            moment(getReservations.rows[0].t_end).format("DD.MM.YYYY.") +
            `\n\nSmještaj: ` +
            getReservations.rows[0].room_id +
            `\n\nZa dodatne upite nazovite na broj +385992768700\nVidimo se!\nRobinzonski Kamp Lučica`,
        },
        (err, info) => {
          console.log(info.envelope);
          console.log(info.messageId);
        }
      );
      res.json("Rezervacija odobrena");
    }
  } catch (err) {
    console.log(err);
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
//umetanje rezervacije i slanje maila kod poslanog zahtjeva za rezervaciju
app.post("/rezervirajtermin", async (req, res) => {
  try {
    //testni console log
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
    let transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST,
      port: process.env.MAIL_PORT,
      secure: false, // upgrade later with STARTTLS
      auth: {
        user: process.env.MAIL_IME,
        pass: process.env.MAIL_PASS,
      },
      tls: {
        // do not fail on invalid certs
        rejectUnauthorized: false,
      },
    });
    transporter.verify(function (error, success) {
      if (error) {
        console.log(error);
      } else {
        console.log("Uspjesno spajanje na mail posluzitelj");
      }
    });
    transporter.sendMail(
      {
        from: process.env.MAIL_IME,
        to: "marin@robinzonlucica.hr",
        subject: `Rezervacija za ${imeGosta}`,
        text:
          `Pozdrav Marin,\n\n rezervacija na ime: ${imeGosta}\n Za datum od ` +
          moment(pocetniDatum).format("DD.MM.YYYY.") +
          ` do ` +
          moment(krajniDatum).format("DD.MM.YYYY.") +
          `\nSmještaj: ${smjestajIme}\nMobilni broj: ${brojGosta}\nMail: ${mailGosta} je poslana\nProvjeri rezervaciju na stranici za odobrenje!`,
      },
      (err, info) => {
        console.log(info.envelope);
        console.log(info.messageId);
      }
    );
  } catch (err) {
    res.json("Neuspješna rezervacija");
  }
});
//slanje rezerviranih datuma
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
