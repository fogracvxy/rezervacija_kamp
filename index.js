import express from "express";
import { Server } from "socket.io";
import helmet from "helmet";
import cors from "cors";
import authRouter from "./routers/authRouter.js";
import session from "express-session";
import connectPg from "connect-pg-simple";
import pool from "./db.js";
import { createServer } from "http";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import pg from "pg";
const app = express();
const pgSession = connectPg(session);
const server = createServer(app);
const PORT = process.env.PORT || 3001;
//middleware
dotenv.config();
app.set("trust proxy", 1);
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
      "img-src": ["'self'", "data:", "https:", "https: data: blob:"],
      "style-src": ["'self'", "data:", "https:", "'unsafe-inline'"],
      "script-src": ["'unsafe-inline'", "'self'", "https:", "'unsafe-eval'"],
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
const authorizationMiddleware = (req, res, next) => {
  // Extract the username from the URL, assuming the URL format is '/uploads/usersprofile/{username}/...'
  const requestedUsername = req.path.split("/")[1];
  console.log(requestedUsername);
  // Check if the user is authenticated and if the authenticated user's username matches the requested username
  if (req.session.user && req.session.user.username === requestedUsername) {
    next();
  } else {
    res.status(403).send("Forbidden");
  }
};
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
app.use(express.static(join(__dirname, "client/build")));

app.use("/uploads", (req, res, next) => {
  if (req.session.user && req.session.user.username) {
    next();
  } else {
    res.status(401).end();
  }
});

// Authorization middleware for user profile pictures
app.use("/uploads/usersprofile", authorizationMiddleware);
// Serve all static files from the /uploads directory (including nested directories)
app.use("/uploads", express.static(join(__dirname, "./uploads")));
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "client/build")));
}
//čitanje rezervacija

app.use("/auth", authRouter);
//brisanje rezervacija
io.on("connect", (socket) => {
  socket.on("error", (err) => {
    console.error(`Socket error: ${err}`);
  });
});
//umetanje rezervacije i slanje maila kod poslanog zahtjeva za rezervaciju

app.get("*", (req, res) => {
  res.sendFile(join(__dirname, "client/build/index.html"));
});

io.on("connect", (socket) => {});
//listen na portu 3001
app.listen(PORT, () => {
  console.log(`Server je pokrenut na portu ${PORT}`);
});
