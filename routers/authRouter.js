const express = require("express");
const validateForm = require("../controllers/validateForm");
const validateFormLogin = require("../controllers/validateFormLogin");
const router = express.Router();
const pool = require("../db");
const multer = require("multer");
const sharp = require("sharp");
const bcrypt = require("bcrypt");
const moment = require("moment");
const crypto = require("crypto");
const fsPromises = require("fs/promises");
const path = require("path");
const CLIENT_HOME_PAGE_URL = "/login";
const maxSize = 2097152; // 2MB
const nodemailer = require("nodemailer");
async function checkAdmin(req, res, next) {
  if (!req.session.user) {
    res
      .status(401)
      .json({ status: "error", message: "You are not logged in." });
    return;
  }
  /*   const provjeraAdmina = await pool.query(
    "SELECT role FROM users WHERE id = $1",
    [req.session.user.id]
  ); */
  const {
    rows: [user],
  } = await pool.query("SELECT role FROM users WHERE id = $1", [
    req.session.user.id,
  ]);
  if (!user.role === "Admin") {
    res.status(403).json({
      status: "error",
      message: "You are not authorized to perform this action.",
    });
    return;
  }
  next();
}
router.route("/login").get(async (req, res) => {
  if (req.session.user && req.session.user.username) {
    const potentialLogin = await pool.query(
      "SELECT id, username, ime, prezime, mail, role, profileimg FROM users u WHERE u.username=$1",
      [req.session.user.username]
    );

    if (potentialLogin.rows.length > 0) {
      res.json({
        loggedIn: true,
        username: req.session.user.username,
        id: potentialLogin.rows[0].id,
        ime: potentialLogin.rows[0].ime,
        prezime: potentialLogin.rows[0].prezime,
        mail: potentialLogin.rows[0].mail,
        role: potentialLogin.rows[0].role,
        profileimg: potentialLogin.rows[0].profileimg,
      });
    } else {
      res.json({ loggedIn: false });
    }
  } else {
    res.json({ loggedIn: false });
  }
});

router.route("/login").post(async (req, res) => {
  validateFormLogin(req, res);

  const potentialLogin = await pool.query(
    "SELECT id, username, passhash, ime, prezime, mail, role, profileimg, email_verified FROM users u WHERE u.username=$1",
    [req.body.username]
  );

  if (potentialLogin.rowCount > 0) {
    const isSamePass = await bcrypt.compare(
      req.body.password,
      potentialLogin.rows[0].passhash
    );
    if (isSamePass) {
      if (potentialLogin.rows[0].email_verified) {
        req.session.user = {
          username: req.body.username,
          id: potentialLogin.rows[0].id,
        };
        res.json({
          loggedIn: true,
          username: req.session.user.username,
          id: potentialLogin.rows[0].id,
          ime: potentialLogin.rows[0].ime,
          prezime: potentialLogin.rows[0].prezime,
          mail: potentialLogin.rows[0].mail,
          role: potentialLogin.rows[0].role,
          profileimg: potentialLogin.rows[0].profileimg,
        });
      } else {
        res.json({
          loggedIn: false,
          status: "Please verify your email before logging in!",
        });
      }
    } else {
      res.json({ loggedIn: false, status: "Krivi username ili password!" });
      console.log("ne dela");
    }
  } else {
    console.log("ne dela");
    res.json({ loggedIn: false, status: "Krivi username ili password!" });
  }
});
router.post("/resend-verification-email", async (req, res) => {
  const userEmail = req.body.mail;

  const userQuery = await pool.query(
    "SELECT id, email_verified FROM users WHERE mail=$1",
    [userEmail]
  );

  if (userQuery.rowCount === 0) {
    res.json({ success: false, message: "No user found with this email." });
  } else {
    const user = userQuery.rows[0];

    if (user.email_verified) {
      res.json({ success: false, message: "Email is already verified." });
    } else {
      // Generate a new token and expiry date
      const token = crypto.randomBytes(32).toString("hex");
      const expires_at = new Date();
      expires_at.setHours(expires_at.getHours() + 24);

      // Update email_tokens table
      await pool.query(
        "UPDATE email_tokens SET token=$1, expires_at=$2 WHERE user_id=$3",
        [token, expires_at, user.id]
      );

      // Send the new verification email
      const verificationLink = `http://localhost:3001/auth/confirm-email?token=${token}`;

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

      const mailOptions = {
        from: process.env.MAIL_IME,
        to: req.body.mail,
        subject: "Email Verification",
        text: `Click on the following link to verify your email: ${verificationLink}`,
        html: `
          <div style="
            background-color: #f7f7f7;
            font-family: Arial, sans-serif;
            padding: 30px;
            text-align: center;
          ">
            <h1 style="color: #333;">Welcome to Our Website!</h1>
            <h2 style="color: #666;">Email Verification</h2>
            <p style="color: #333; font-size: 16px;">
              Thanks for signing up! Please click the button below to verify your email address.
            </p>
            <a href="${verificationLink}" style="
              background-color: #3498db;
              color: #fff;
              display: inline-block;
              font-size: 16px;
              padding: 12px 24px;
              text-decoration: none;
              margin: 10px 0;
              border-radius: 4px;
            ">
              Verify Your Email
            </a>
            <p style="color: #666; font-size: 14px;">
              If the button above doesn't work, copy and paste the following link into your browser:
            </p>
            <p style="color: #666; font-size: 14px; word-break: break-all;">
              <a href="${verificationLink}" style="color: #3498db; text-decoration: none;">
                ${verificationLink}
              </a>
            </p>
          </div>
        `,
      };

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.log("Error sending email:", error);
        } else {
          console.log("Email sent:", info.response);
        }
      });

      res.json({
        success: true,
        message: "Verification email has been resent.",
      });
    }
  }
});
router.post("/signup", async (req, res) => {
  validateForm(req, res);

  const existingUser = await pool.query(
    "SELECT username, mail from users WHERE username=$1 OR mail=$2",
    [req.body.username, req.body.mail]
  );

  if (existingUser.rowCount === 0) {
    // register
    const hashedPass = await bcrypt.hash(req.body.password, 10);
    const newUserQuery = await pool.query(
      "INSERT INTO users(username, passhash, ime, prezime, mail, email_verified) values($1,$2,$3,$4,$5,$6) RETURNING id, username, ime, prezime, mail",
      [
        req.body.username,
        hashedPass,
        req.body.ime,
        req.body.prezime,
        req.body.mail,
        false,
      ]
    );

    // generate email verification token
    const token = crypto.randomBytes(32).toString("hex");
    const expires_at = new Date();
    expires_at.setHours(expires_at.getHours() + 24); // token expires in 24 hours

    await pool.query(
      "INSERT INTO email_tokens(user_id, token, expires_at) VALUES ($1, $2, $3)",
      [newUserQuery.rows[0].id, token, expires_at]
    );

    // send email with verification link
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

    const verificationLink = `http://localhost:3001/auth/confirm-email?token=${token}`;

    const mailOptions = {
      from: process.env.MAIL_IME,
      to: req.body.mail,
      subject: "Email Verification",
      text: `Click on the following link to verify your email: ${verificationLink}`,
      html: `
        <div style="
          background-color: #f7f7f7;
          font-family: Arial, sans-serif;
          padding: 30px;
          text-align: center;
        ">
          <h1 style="color: #333;">Welcome to Our Website!</h1>
          <h2 style="color: #666;">Email Verification</h2>
          <p style="color: #333; font-size: 16px;">
            Thanks for signing up! Please click the button below to verify your email address.
          </p>
          <a href="${verificationLink}" style="
            background-color: #3498db;
            color: #fff;
            display: inline-block;
            font-size: 16px;
            padding: 12px 24px;
            text-decoration: none;
            margin: 10px 0;
            border-radius: 4px;
          ">
            Verify Your Email
          </a>
          <p style="color: #666; font-size: 14px;">
            If the button above doesn't work, copy and paste the following link into your browser:
          </p>
          <p style="color: #666; font-size: 14px; word-break: break-all;">
            <a href="${verificationLink}" style="color: #3498db; text-decoration: none;">
              ${verificationLink}
            </a>
          </p>
        </div>
      `,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log("Error sending email:", error);
      } else {
        console.log("Email sent:", info.response);
      }
    });

    res.json({
      registered: true,
    });
  } else {
    res.json({ loggedIn: false, status: "Korisnik postoji" });
  }
});
router.get("/confirm-email", async (req, res) => {
  const token = req.query.token;

  if (!token) {
    return res.status(400).json({ error: "Token is missing" });
  }

  try {
    const tokenQuery = await pool.query(
      "SELECT user_id, expires_at FROM email_tokens WHERE token=$1",
      [token]
    );

    if (tokenQuery.rowCount === 0) {
      return res.status(400).json({ error: "Invalid token" });
    }

    const { user_id, expires_at } = tokenQuery.rows[0];

    if (new Date() > expires_at) {
      return res.status(400).json({ error: "Token has expired" });
    }

    await pool.query("UPDATE users SET email_verified=true WHERE id=$1", [
      user_id,
    ]);
    await pool.query("DELETE FROM email_tokens WHERE token=$1", [token]);

    res.json({ message: "Email successfully verified!" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// multer spremanje lokalno diskStorage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.resolve(__dirname, "../uploads/usersprofile"));
  },
  filename: function (req, file, cb) {
    cb(
      null,
      file.fieldname +
        "_" +
        `${req.session.user.username}` +
        Date.now() +
        `${path.extname(file.originalname)}`
    );
  },
});

const myMulter = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (
      file.mimetype == "image/png" ||
      file.mimetype == "image/jpg" ||
      file.mimetype == "image/jpeg"
    ) {
      cb(null, true);
    } else {
      return cb(new Error("Only .png, .jpg and .jpeg format allowed!"));
    }
  },
  limits: { fileSize: maxSize },
});

const upload = myMulter.single("avatar");
// ruta za dohvacanje profilnih fotki za usera
router.get("/profilepicture", (req, res) => {
  if (req.session.user && req.session.user.username) {
    pool.query(
      "SELECT profileimg FROM users where username=$1",
      [req.session.user.username],
      (err, result) => {
        if (err) {
          console.log(err);
        } else {
          res.send({
            source: result.rows[0].profileimg,
          });
        }
      }
    );
  }
});
router.post("/rezervirajtermin", async (req, res) => {
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
      "INSERT INTO reservations(reservation_dates,room_id,user_mail, user_name ,user_phone, created_by) VALUES(tstzrange($1, $2, '[)'),$3, $4, $5, $6, $7)",
      [
        pocetniDatum,
        krajniDatum,
        smjestajIme,
        mailGosta,
        imeGosta,
        brojGosta,
        req.session.user.username,
      ]
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
// ruta za upload fotki
router.post("/uploadpicture", async (req, res) => {
  if (req.session.user && req.session.user.username) {
    //dohvat fotografija iz baze prijasnjih kako bi kad se uploada krivi file ili file vece velicine nebi maknula fotografija korisnika
    const sqlprofile = await pool.query(
      "SELECT profileimg FROM users where username=$1",
      [req.session.user.username]
    );
    upload(req, res, async function (err) {
      if (err instanceof multer.MulterError) {
        res.send({
          title: "Error",
          response: "Dozvoljena maksimalna veličina 2MB",
          status: "error",
          source: sqlprofile.rows[0].profileimg,
        });
      } else if (err) {
        res.send({
          title: "Error",
          response: "Dozvoljeni formati: .png/.jpg/.jpeg ",
          status: "error",
          source: sqlprofile.rows[0].profileimg,
        });
      } else {
        //file path za spremanje nove datotke
        const filePaths = path.resolve(
          __dirname,
          `../uploads/usersprofile/${req.file.filename}`
        );
        //buffer kako bi uzeli buffer fotke i onda ju overwritali sa starim fajlom (sharp(buffer).toFile(filePaths);)
        const buffer = await sharp(req.file.path)
          .resize({ width: 300, height: 300 })
          .toBuffer();
        sharp(buffer).toFile(filePaths);
        //ubacivanje u profileimg usera "/putanja
        //brisanje fotografije iz storagea
        const profileDelete = await pool.query(
          "SELECT profileimg FROM users where username=$1",
          [req.session.user.username]
        );

        if (profileDelete.rowCount === 0) {
          console.log("error ne treba obrisati nista");
        } else {
          //filepath za brisanje stare datoteke
          const filePath = path.resolve(
            __dirname,
            `../uploads/usersprofile/${profileDelete.rows[0].profileimg}`
          );
          // funkcija za brisanje profilne fotografije prosle
          const deleteFile = async (filePath) => {
            try {
              await fsPromises.unlink(filePath);
            } catch (err) {
              console.log(err);
            }
          };
          //pozivanje funkcije za brisanje prosle fotografije
          deleteFile(filePath);
        }
        // updejt na bazi sa novim imenom fotografije za doredenog usera
        pool.query(
          "UPDATE users SET profileimg=$1 WHERE username=$2 RETURNING profileimg",
          [req.file.filename, req.session.user.username],
          (err, result) => {
            if (err) {
              console.log(err);
            } else {
              res.send({
                title: "Upload",
                response: "Upload uspješan",
                status: "success",
                source: result.rows[0].profileimg,
              });
            }
          }
        );
      }
    });
  } else {
    //U slucaju da netko nije loginan i pokusava uploadat fotku
    res.json({
      title: "Error",
      response: "Prijavite se u sustav",
      status: "error",
    });
  }
});
router.delete("/rezervacijadelete/:id", async (req, res) => {
  if (req.session.user && req.session.user.username) {
    try {
      const { id } = req.params;
      await pool.query("DELETE FROM reservations WHERE id = $1", [id]);
      res.json("Rezervacija obrisana");
    } catch (err) {
      res.json("Greška kod brisanja");
    }
  } else {
    res.json({
      title: "Error",
      response: "Prijavite se u sustav",
      status: "error",
    });
  }
});
router.put("/rezervacijaodobri/:id", async (req, res) => {
  if (req.session.user && req.session.user.username) {
    try {
      // Postgresql daje mogucnost da nakon updejta vratimo updejtano
      const { id } = req.params;
      const getReservations = await pool.query(
        "UPDATE reservations SET odobreno = true WHERE id = $1 RETURNING *,lower(reservation_dates) as t_start, upper(reservation_dates) AS t_end ",
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
  } else {
    res.json({
      title: "Error",
      response: "Prijavite se u sustav",
      status: "error",
    });
  }
});
//citanje smjestaja
router.get("/smjestaj", async (req, res) => {
  if (req.session.user && req.session.user.username) {
    try {
      const sveSobe = await pool.query("SELECT * from rooms");
      res.json(sveSobe.rows);
    } catch (err) {
      console.error(err.message);
    }
  } else {
    res.json({
      title: "Error",
      response: "Prijavite se u sustav",
      status: "error",
    });
  }
});

router.get("/userreservation", async (req, res) => {
  if (req.session.user && req.session.user.username) {
    try {
      const rezervacijeKorisnika = await pool.query(
        "SELECT *, lower(reservation_dates) as t_start, upper(reservation_dates) AS t_end  from reservations where created_by=$1",
        [req.session.user.username]
      );
      res.json(rezervacijeKorisnika.rows);
    } catch (err) {
      console.error(err.message);
    }
  } else {
    res.json({
      title: "Error",
      response: "Prijavite se u sustav",
      status: "error",
    });
  }
});
/* router.get("/rezervacijelista", async (req, res) => {
  if (req.session.user && req.session.user.username) {
    try {
      const sveRezervacije = await pool.query(
        "SELECT *, lower(reservation_dates) as t_start, upper(reservation_dates) AS t_end FROM reservations"
      );
      res.json(sveRezervacije.rows);
    } catch (err) {
      console.error(err.message);
    }
  } else {
    res.json({
      title: "Error",
      response: "Prijavite se u sustav",
      status: "error",
    });
  }
}); */
router.post("/rezerviranidatumi", async (req, res) => {
  if (req.session.user && req.session.user.username) {
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
  } else {
    res.json({
      title: "Error",
      response: "Prijavite se u sustav",
      status: "error",
    });
  }
});
router.post("/reporterror", (req, res) => {
  if (req.session.user && req.session.user.username) {
    const imeKorisnika = req.body.name;
    const mailKorisnika = req.body.email;
    const opisGreske = req.body.message;
    console.log(req.body);
    console.log(imeKorisnika);
    console.log(mailKorisnika);
    console.log(opisGreske);
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
        from: `${mailKorisnika}`,
        to: "prijavagreske@sgis.hr",
        subject: `Prijava greske za ${imeKorisnika} na dan ${moment().format(
          "DD.MM.YYYY."
        )}`,
        text: `${opisGreske}`,
      },
      (err, info) => {
        if (err) {
          res.json({
            title: "Error",
            response: "Problem kod slanja pokušajte ponovo",
            status: "error",
          });
        } else {
          res.json({
            title: "Prijava greške",
            response: "Prijava poslana",
            status: "success",
          });
        }
      }
    );
  }
});

router.route("/rezervacijelista").get(checkAdmin, async (req, res) => {
  if (req.session.user && req.session.user.username) {
    try {
      const sveRezervacije = await pool.query(
        "SELECT *, lower(reservation_dates) as t_start, upper(reservation_dates) AS t_end FROM reservations"
      );
      res.json(sveRezervacije.rows);
    } catch (err) {
      console.error(err.message);
    }
  } else {
    res.json({
      title: "Error",
      response: "Prijavite se u sustav",
      status: "error",
    });
  }
}); //pripremio sam ovaj route za adminCheck djelove
/*   .post(checkAdmin, (req, res) => {
    //stuff here
  }); */
router.get("/logout", (req, res) => {
  req.session.destroy(function (err) {
    if (err) {
      console.log(err);
    } else {
      res.sendStatus(200);
    }
  });
});
module.exports = router;
