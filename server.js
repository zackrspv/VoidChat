import express from "express";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import path from "node:path";
import http from "node:http";
import dotenv from "dotenv";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { authRoute, authenticate } from "./api/auth.js";
import gateway from "./api/gateway.js";

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

// Limit repeated requests from the same IP address using Express Rate Limit middleware
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // limit each IP to 100 requests per windowMs
});
app.use(limiter);

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

// CORS headers to allow cross-origin requests
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

// Logout route to clear authentication token
app.get("/logout", (req, res) => {
  res.clearCookie("token");
  res.redirect("/login");
});

// Authentication routes
app.post("/api/auth", authRoute);

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

// Server-sent events (SSE) route to refresh connected clients
app.get("/refresh", (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  res.write(": comment\n\n");

  const client = {
    id: Date.now(),
    res,
  };
  clients.push(client);

  req.on("close", () => {
    const index = clients.findIndex((c) => c.id === client.id);
    if (index !== -1) {
      clients.splice(index, 1);
    }
  });
});

// Function to send refresh event to connected clients
function sendRefreshEvent() {
  clients.forEach((client) => {
    client.res.write(`event: refresh\n\n`);
  });
}

// Start the server
server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
  if (enableLogging) {
    console.log("***********************");
    console.log(`** ${logMessage} **`);
    console.log("***********************");
  }

  // Send refresh event to connected clients when the server restarts
  sendRefreshEvent();
});
