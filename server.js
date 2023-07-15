import express from "express";
import cookieParser from "cookie-parser";
import path from "node:path";
import http from "node:http";
import dotenv from "dotenv";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { authRoute, authenticate } from "./api/auth.js";
import gateway from "./api/gateway.js";
import open from 'open';

dotenv.config();
const port = process.env.PORT || 8080;
const enableLogging = process.argv.includes("-log");
const filterIcons = process.argv.includes("-icons");
const filterApp = process.argv.includes("-app");
// Check if logging flag is enabled
if ((filterIcons || filterApp) && !enableLogging) {
  console.error("You must run this with -log enabled!");
  process.exit(1);
}

let logMessage = "Logging is enabled";
if (enableLogging) {
  if (filterIcons) {
    logMessage = "Icon logging is enabled";
  } else if (filterApp) {
    logMessage = "App logging is enabled";
  }
}

const app = express();
const server = http.createServer(app);

// Store connected clients
const clients = [];

// Set security headers using Helmet middleware with relaxed options
  // CSP break images
    // https://media.discordapp.net/attachments/610384874280583178/1120691890023583817/image.png?width=1286&height=205
    // https://media.discordapp.net/attachments/610384874280583178/1120693479157284984/image.png?width=1366&height=407
  
app.use(helmet({
  contentSecurityPolicy: false,  // Enabling the CSP breaks the site completely. 
  dnsPrefetchControl: true,     
  frameguard: true,
  hsts: true,
  ieNoOpen: true,
  noSniff: true,
  xssFilter: true
}));

// Middleware for parsing JSON and URL-encoded data
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// Middleware for logging incoming requests
app.use((req, res, next) => {
  const { url } = req;
  if (
    (enableLogging && (!filterIcons && !filterApp)) ||
    (enableLogging && filterIcons && url.startsWith("/icons")) ||
    (enableLogging && filterApp && url.startsWith("/app"))
  ) {
    console.log(`[${new Date().toLocaleString()}] ${req.method} ${req.url}`);
  }
  next();
});

// Logout route to clear authentication token
app.get("/logout", (req, res) => {
  res.clearCookie("token");
  res.redirect("/login");
});

// Rate limiter middleware for /api/auth route
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limit each IP to 10 requests per windowMs
  handler: (req, res) => {
    const clientIp = req.ip;
    // console.log(`[${clientIp}] is being rate limited!`);   view client ip thats being rate limited, for debugging only
    res.status(429).json({ error: 'Too many requests' });  // Too many requests error on the users side.
  }
});

// Apply rate limiter middleware to /api/auth route
app.post("/api/auth", authLimiter, authRoute);

// Main app route to redirect to the app's home page
app.get("/", (req, res) => {
  res.redirect("/app");
});

// Middleware to authenticate app routes
app.use("/app", authenticate);

// Serve static files from the "public" directory
app.use(express.static(path.join(process.cwd(), "public"), {
  extensions: ['html', 'htm']
}));

// Handle API gateway
gateway(app);

// Start the server
server.listen(port, () => {
  open(`http://localhost:${port}`);
  console.log(`Server is running on port ${port}`);
  if (enableLogging) {
    console.log("***********************");
    console.log(`** ${logMessage} **`);
    console.log("***********************");
  }
});
