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

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// Request logging middleware
if (enableLogging) {
  app.use((req, res, next) => {
    console.log(`[${new Date().toLocaleString()}] ${req.method} ${req.url}`);
    next();
  });
}

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
    console.log("					** Logging is enabled **");
    console.log("					***********************");
  }
});
