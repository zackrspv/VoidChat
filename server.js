import express from "express";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import path from "node:path";
import http from "node:http";
import dotenv from "dotenv";
import { WebSocketServer } from "ws";
import { authRoute, authenticate } from "./api/auth.js";
import gateway from "./api/gateway.js";

dotenv.config();
const port = process.env.PORT || 8080;
const enableLogging = process.argv.includes("-log");
const filterIcons = process.argv.includes("-icons");
const filterApp = process.argv.includes("-app");

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
const wss = new WebSocketServer({ server });

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// Security middleware
app.use((req, res, next) => {
  // Set security headers
  res.setHeader("X-XSS-Protection", "1; mode=block");
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
  res.setHeader("X-Frame-Options", "DENY");

  // Prevent parameter pollution
  const pollutedParams = Object.keys(req.query).filter(
    (key) => Array.isArray(req.query[key])
  );
  if (pollutedParams.length > 0) {
    return res.status(400).json({ message: "Parameter pollution detected." });
  }

  next();
});

// Request logging middleware
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

// CORS headers
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

// Login routes
app.get("/logout", (req, res) => {
  res.clearCookie("token");
  res.redirect("/login");
});

// Auth routes
app.post("/auth", authRoute);

// App routes
app.get("/", (req, res) => {
  res.redirect("/app");
});

app.use("/app", authenticate);
app.use(express.static(path.join(process.cwd(), "public"), {
  extensions: ['html', 'htm']
}));

// Handle API gateway
gateway(app, wss);

// Start the server
server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
  if (enableLogging) {
    console.log("					***********************");
    console.log(`					** ${logMessage} **`);
    console.log("					***********************");
  }
});
