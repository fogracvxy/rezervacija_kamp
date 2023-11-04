import express from "express";
import validateForm from "../controllers/validateForm.js";
import validateFormLogin from "../controllers/validateFormLogin.js";
const router = express.Router();
import pool from "../db.js";
import multer from "multer";
import sharp from "sharp";
import bcrypt from "bcryptjs";
import moment from "moment";
import fsPromises from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
const maxSize = 2097152; // 2MB
import nodemailer from "nodemailer";
import crypto from "crypto";
import fs from "fs-extra";
import { fileTypeFromBuffer } from "file-type";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";
import speakeasy from "speakeasy";
import QRCode from "qrcode";
dotenv.config();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
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
const checkUserSession = (req, res) => {
  if (!req.session.user || !req.session.user.username) {
    res.status(401).send("Unauthorized");
    return false;
  }
  return true;
};
const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10,
  message: {
    title: "Error",
    response: "Limit reached: Maximum 10 uploads per hour",
    status: "error",
  },
});
router
  .route("/login")
  .get(async (req, res) => {
    if (req.session.user && req.session.user.username) {
      const potentialLogin = await pool.query(
        "SELECT id, username, ime, prezime, mail, role, profileimg, two_factor_enabled, birthdate FROM users u WHERE u.username=$1",
        [req.session.user.username]
      );
      const user = potentialLogin.rows[0];
      console.log(user);
      const birthdatefixed = moment(user.birthdate).format("DD.MM.YYYY.");
      if (potentialLogin.rows.length > 0) {
        res.json({
          loggedIn: true,
          username: req.session.user.username,
          id: user.id,
          ime: user.ime,
          prezime: user.prezime,
          mail: user.mail,
          role: user.role,
          two_factor_enabled: user.two_factor_enabled,
          profileimg: user.profileimg,
          birthdate: birthdatefixed,
        });
      } else {
        res.json({ loggedIn: false });
      }
    } else {
      res.json({ loggedIn: false });
    }
  })
  .post(validateFormLogin, async (req, res) => {
    const potentialLogin = await pool.query(
      "SELECT id, username, passhash, ime, prezime, mail, role, profileimg, email_verified, two_factor_enabled, two_factor_secret, birthdate FROM users u WHERE u.username=$1",
      [req.body.username]
    );

    if (potentialLogin.rowCount > 0) {
      const user = potentialLogin.rows[0];
      const isSamePass = await bcrypt.compare(req.body.password, user.passhash);
      console.log(user);
      if (isSamePass) {
        if (!user.email_verified) {
          // If the user's email is not verified, return an error message
          return res.status(401).json({
            loggedIn: false,
            status: "Molim vas potvrdite mail adresu prije prijave!",
          });
        }

        if (user.two_factor_enabled) {
          req.session.partialUser = {
            username: req.body.username,
            id: user.id,
            two_factor_secret: user.two_factor_secret,
            twoFactorEnabled: true,
          };
          return res.json({ twoFactorEnabled: true });
        } else {
          req.session.user = {
            username: req.body.username,
            id: user.id,
          };
          return res.json({
            loggedIn: true,
            username: user.username,
            id: user.id,
            ime: user.ime,
            prezime: user.prezime,
            mail: user.mail,
            role: user.role,
            profileimg: user.profileimg,
            birthdate: user.birthdate,
          });
        }
      } else {
        delete req.session.partialUser;
        return res
          .status(400)
          .json({ loggedIn: false, status: "Krivi username ili password!" });
      }
    } else {
      delete req.session.partialUser;
      return res
        .status(400)
        .json({ loggedIn: false, status: "Krivi username ili password!" });
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
  const birthdate = req.body.birthdate
    ? new Date(req.body.birthdate).toISOString().split("T")[0]
    : null;
  if (existingUser.rowCount === 0) {
    // register
    const hashedPass = await bcrypt.hash(req.body.password, 10);
    const newUserQuery = await pool.query(
      "INSERT INTO users(username, passhash, ime, prezime, mail, email_verified, birthdate) values($1,$2,$3,$4,$5,$6,$7) RETURNING id, username, ime, prezime, mail, birthdate",
      [
        req.body.username,
        hashedPass,
        req.body.ime,
        req.body.prezime,
        req.body.mail,
        false,
        birthdate,
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

const memoryStorage = multer.memoryStorage();

const myMulter = multer({
  storage: memoryStorage,
  limits: { fileSize: maxSize },
});
const upload = myMulter.single("avatar");
const defaultImageName = "default.jpg";
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
router.post("/uploadpicture", uploadLimiter, upload, async (req, res) => {
  if (!checkUserSession(req, res)) return;

  if (req.fileValidationError) {
    res.send({
      title: "Error",
      response: req.fileValidationError,
      status: "error",
    });
    return;
  }

  if (!req.file) {
    res.send({
      title: "Error",
      response: "No file received",
      status: "error",
    });
    return;
  }

  const fileType = await fileTypeFromBuffer(req.file.buffer);
  if (!fileType || !["jpg", "jpeg", "png"].includes(fileType.ext)) {
    res.send({
      title: "Error",
      response: "Invalid file type. Please upload a jpg, jpeg, or png file.",
      status: "error",
    });
    return;
  }

  const profileDelete = await pool.query(
    "SELECT profileimg FROM users where username=$1",
    [req.session.user.username]
  );

  try {
    const randomString = crypto.randomBytes(8).toString("hex");
    const filename =
      req.file.fieldname +
      "_" +
      `${req.session.user.username}` +
      Date.now() +
      randomString +
      `${path.extname(req.file.originalname)}`;

    const destinationDir = path.resolve(
      __dirname,
      `../uploads/usersprofile/${req.session.user.username}/profilepicture/`
    );
    await ensureDir(destinationDir);

    const destinationPath = path.join(destinationDir, filename);
    await sharp(req.file.buffer)
      .resize({ width: 300, height: 300 })
      .toFile(destinationPath);
    const databaseurlSave =
      `/uploads/usersprofile/${req.session.user.username}/profilepicture/` +
      filename;
    pool.query(
      "UPDATE users SET profileimg=$1 WHERE username=$2 RETURNING profileimg",
      [databaseurlSave, req.session.user.username],
      async (err, result) => {
        if (err) {
          console.log(err);
        } else {
          if (
            profileDelete.rowCount !== 0 &&
            profileDelete.rows[0].profileimg &&
            profileDelete.rows[0].profileimg !== defaultImageName
          ) {
            const oldFileName = path.basename(profileDelete.rows[0].profileimg);
            const filePath = path.resolve(
              __dirname,
              `../uploads/usersprofile/${req.session.user.username}/profilepicture/` +
                oldFileName
            );

            if (fs.existsSync(filePath)) {
              try {
                await fsPromises.unlink(filePath);
              } catch (err) {
                console.log(`Error while deleting file: ${err}`);
              }
            } else {
              console.log(`File does not exist, skipping delete: ${filePath}`);
            }
          }

          res.send({
            title: "Upload",
            response: "Upload successful",
            status: "success",
            source: result.rows[0].profileimg,
          });
        }
      }
    );
  } catch (error) {
    console.log(`General error: ${error}`);
    res.status(500).send("Internal Server Error");
  }
});

router.post("/delete-profile-picture", async (req, res) => {
  if (!checkUserSession(req, res)) return;

  try {
    // Get the old profile picture
    const profileDelete = await pool.query(
      "SELECT profileimg FROM users where username=$1",
      [req.session.user.username]
    );

    if (profileDelete.rowCount !== 0) {
      const filePath = path.resolve(
        __dirname,
        `..${profileDelete.rows[0].profileimg}`
      );

      if (fs.existsSync(filePath)) {
        await fsPromises.unlink(filePath);
      }
    }

    // Reset profile image in the database to default or null
    await pool.query("UPDATE users SET profileimg = NULL WHERE username = $1", [
      req.session.user.username,
    ]);

    res.json({ status: "success" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ status: "error" });
  }
});

async function ensureDir(dirpath) {
  try {
    await fsPromises.access(dirpath);
  } catch (error) {
    await fsPromises.mkdir(dirpath, { recursive: true });
  }
}
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
});

function generateBackupCodes(count, length) {
  const codes = [];
  for (let i = 0; i < count; i++) {
    codes.push(crypto.randomBytes(length).toString("hex"));
  }
  return codes;
}

// Function to hash backup codes
async function hashBackupCodes(codes) {
  const hashedCodes = [];
  for (const code of codes) {
    const hash = await bcrypt.hash(code, 10); // 10 is the cost factor for bcrypt
    hashedCodes.push(hash);
  }
  return hashedCodes;
}
router.post("/generate-backup-codes", async (req, res) => {
  try {
    const userId = req.session.user.id;
    const rawCodes = generateBackupCodes(10, 6); // Generate 10 backup codes, each 6 bytes long
    const hashedCodes = await hashBackupCodes(rawCodes);

    // Store hashed codes in the database
    await pool.query(
      "UPDATE users SET two_factor_backup_codes = $1 WHERE id = $2",
      [hashedCodes, userId]
    );

    // Send the raw codes to the user
    res.json({ backupCodes: rawCodes });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not generate backup codes" });
  }
});

// When verifying 2FA with a backup code
router.post("/verify-backup-code", async (req, res) => {
  const { backupCode } = req.body;
  const userId = req.session.user.id;

  // Retrieve the hashed backup codes from the database
  const result = await pool.query(
    "SELECT two_factor_backup_codes FROM users WHERE id = $1",
    [userId]
  );
  const hashedCodes = result.rows[0].two_factor_backup_codes;

  // Find the backup code and verify it
  let codeIndex = -1;
  for (let i = 0; i < hashedCodes.length; i++) {
    const validCode = await bcrypt.compare(backupCode, hashedCodes[i]);
    if (validCode) {
      codeIndex = i;
      break;
    }
  }

  if (codeIndex !== -1) {
    // Remove the used backup code from the database
    hashedCodes.splice(codeIndex, 1);
    await pool.query(
      "UPDATE users SET two_factor_backup_codes = $1 WHERE id = $2",
      [hashedCodes, userId]
    );

    // Proceed with login or other action
    res.json({ verified: true });
  } else {
    res.status(400).json({ verified: false, error: "Invalid backup code!" });
  }
});
router.route("/generate-2fa").post(async (req, res) => {
  const secret = speakeasy.generateSecret({ length: 20 }); // Generates a 20-byte secret
  const dataUrl = await QRCode.toDataURL(secret.otpauth_url);

  // Store the secret in the session for later verification
  req.session.temp_2fa_secret = secret.base32;

  // Make sure to save the session if your session store is not auto-saving
  req.session.save((err) => {
    if (err) {
      res.status(500).json({ error: "Failed to save session information." });
      return;
    }
    res.json({ url: dataUrl });
  });
});

router.route("/verify-2fa").post(async (req, res) => {
  const secret = req.session.temp_2fa_secret;

  // Log the secret for debugging purposes; remove this in production
  console.log("Secret used for verification:", secret);

  if (!secret) {
    return res.status(400).json({ error: "No 2FA setup in progress." });
  }

  const token = req.body.token.trim(); // Trim the token to remove any accidental whitespace
  const verified = speakeasy.totp.verify({
    secret,
    encoding: "base32",
    token: token,
    window: 1, // Allow a 30-second window for time drift
  });

  if (verified) {
    // Generate and hash backup codes
    const rawCodes = generateBackupCodes(10, 6);
    const hashedCodes = await hashBackupCodes(rawCodes);

    try {
      // Update the user's 2FA settings in the database
      await pool.query(
        "UPDATE users SET two_factor_secret=$1, two_factor_enabled=true, two_factor_backup_codes=$3 WHERE id=$2",
        [secret, req.session.user.id, JSON.stringify(hashedCodes)] // Stringify the JSON here
      );

      // Remove the temp secret from the session
      delete req.session.temp_2fa_secret;

      // Return the verified status and the backup codes to the user
      res.json({ verified: true, backupCodes: rawCodes });
    } catch (error) {
      console.error("Database error:", error);
      res.status(500).json({ error: "Failed to update user settings." });
    }
  } else {
    res.status(400).json({ verified: false, error: "Invalid 2FA token!" });
  }
});

router.post("/verify-login-2fa", async (req, res) => {
  const { token } = req.body;
  const partialUser = req.session.partialUser;

  if (!partialUser) {
    return res
      .status(400)
      .json({ loggedIn: false, error: "No partial login found." });
  }
  console.log(partialUser);
  const verified = speakeasy.totp.verify({
    secret: partialUser.two_factor_secret,
    encoding: "base32",
    token,
  });

  if (verified) {
    // Retrieve more details if needed from the database before setting the full user session
    // Assuming you have the user's ID in partialUser.id:
    const userDetails = await pool.query(
      "SELECT role, two_factor_enabled, two_factor_backup_codes, two_factor_secret, two_factor_enabled FROM users WHERE id = $1",
      [partialUser.id]
    );
    const user = userDetails.rows[0];
    req.session.user = {
      ...partialUser, // Spread the existing partialUser details
      role: user.role,
      two_factor_secret: user.two_factor_secret,
      two_factor_enabled: user.two_factor_enabled,
      two_factor_backup_codes: user.two_factor_backup_codes,
    };

    delete req.session.partialUser; // Don't forget to clean up the partialUser
    console.log(req.session);
    res.json({ loggedIn: true, ...req.session.user });
  } else {
    res.status(400).json({ loggedIn: false, error: "Invalid 2FA token!" });
  }
});
router.post("/disable-2fa", async (req, res) => {
  try {
    const userId = req.session.user.id; // Popravljen ovaj dio tu je bio problem
    console.log("About to run SQL query");
    console.log(`User ID: ${userId}`); // Log to confirm

    const result = await pool.query(
      "UPDATE users SET two_factor_enabled = false, two_factor_secret = NULL, two_factor_backup_codes = NULL WHERE id = $1",
      [userId]
    );

    console.log("SQL query executed");
    console.log(`Rows affected: ${result.rowCount}`);

    if (result.rowCount === 0) {
      return res.status(404).json({ disabled: false, error: "User not found" });
    }
    res.json({ disabled: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ disabled: false, error: "Could not disable 2FA" });
  }
});
router.post("/verify-disable-2fa", async (req, res) => {
  const { token } = req.body;
  console.log(req.session);
  const userStoredSecret = req.session.user.two_factor_secret;
  // Retrieve the stored secret
  console.log(userStoredSecret);
  const verified = speakeasy.totp.verify({
    secret: userStoredSecret,
    encoding: "base32",
    token,
  });

  if (verified) {
    // If the token is valid, respond with a success message
    res.json({ verified: true });
  } else {
    // If the token is invalid, respond with an error message
    res.status(400).json({ verified: false, error: "Invalid 2FA token!" });
  }
});

//pripremio sam ovaj route za adminCheck djelove
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
export default router;
