const express = require("express");
const cors = require("cors");
const { Server } = require("socket.io");
const app = express();
const path = require("path");
const pool = require("./db");
const PORT = process.env.PORT || 3001;
const helmet = require("helmet");
const session = require("express-session");
const connectPg = require("connect-pg-simple");
const authRouter = require("./routers/authRouter");
const pgSession = connectPg(session);
const server = require("http").createServer(app);
const nodemailer = require("nodemailer");
const moment = require("moment");
require("dotenv").config();
//middleware
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    credentials: "true",
  },
});
app.use(express.json());
app.use(
  helmet({
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: false,
    // ...
  })
);
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      "default-src": ["'self'"],
      "connect-src": ["'self'", "blob:", "https:"],
      "img-src": ["'self'", "data:", "https:"],
      "style-src": ["'self'", "data:", "https:", "'unsafe-inline'"],
      "script-src": ["'unsafe-inline'", "'self'", "https:"],
      "object-src": ["'none'"],
    },
  })
);
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);
app.use(
  session({
    store: new pgSession({
      pool: pool, // Connection pool
      tableName: "sessions", // Use another table-name than the default "session" one
      createTableIfMissing: true,
    }),
    secret: process.env.COOKIE_SECRET,
    credentials: true,
    name: "sid",
    resave: false,
    saveUninitialized: false,
    cookie: {
      //postaviti na true kada se stavi SSL na stranicu inace nece dat cookie do tada drzati auto
      // postaviti "auto" za cloud.sgis.hr dok ne dode HTTPS
      secure: process.env.NODE_ENV === "production" ? "auto" : "auto",
      httpOnly: true,
      expires: 1000 * 60 * 60 * 24 * 7,
      //postaviti lax za cloud.sgis.hr dok ne dode HTTPS
      sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
    },
  })
);
app.use("/uploads", (req, res, next) => {
  if (req.session.user && req.session.user.username) {
    // user postoji i sesija nastavi dalje.
    next();
  } else {
    // No user object found, terminate the pipeline with .end().
    res.status(401).end();
  }
});
app.use(
  "/uploads",
  express.static(path.join(__dirname, "./uploads/usersprofile"))
);
app.use(express.static(path.join(__dirname, "client/build")));
//rute
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "client/build")));
}
//čitanje rezervacija

app.use("/auth", authRouter);
//brisanje rezervacija

//umetanje rezervacije i slanje maila kod poslanog zahtjeva za rezervaciju

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "client/build/index.html"));
});
io.on("connect", (socket) => {});
//listen na portu 3001
app.listen(PORT, () => {
  console.log(`Server je pokrenut na portu ${PORT}`);
});
