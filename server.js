import express from "express";
import cookieParser from "cookie-parser";
import path from "node:path";
import http from "node:http";
import dotenv from "dotenv";
import helmet from "helmet";
import bodyParser from "body-parser";
import rateLimit from "express-rate-limit";
import { authRoute, authenticate } from "./api/auth.js";
import gateway from "./api/gateway.js";
import open from 'open';
import chalk from 'chalk';

dotenv.config();
const WINDOW_MS = 15 * 60 * 1000;
const port = process.env.PORT || 8080;
const enableLogging = process.argv.includes("-log");
const filterIcons = process.argv.includes("-icons");
const filterApp = process.argv.includes("-app");

if ((filterIcons || filterApp) && !enableLogging) {
  console.error("You must run this with -log enabled!");
  process.exit(1);
}


const app = express();
const server = http.createServer(app);

// Set security headers using Helmet middleware with relaxed options
  // CSP break images
    // https://media.discordapp.net/attachments/610384874280583178/1120691890023583817/image.png?width=1286&height=205
    // https://media.discordapp.net/attachments/610384874280583178/1120693479157284984/image.png?width=1366&height=407


app.use(helmet({
  contentSecurityPolicy: false,
  dnsPrefetchControl: true,
  frameguard: true,
  hsts: true,
  ieNoOpen: true,
  noSniff: true,
  xssFilter: true
}));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

if (enableLogging) {
  const logMessage = filterIcons
    ? chalk.cyan("Icon logging is enabled")
    : filterApp
      ? chalk.yellow("App logging is enabled")
      : chalk.green("Logging is enabled");

  console.log("***********************");
  console.log(`** ${logMessage} **`);
  console.log("***********************");

  app.use((req, res, next) => {
    const { url } = req;
    if (
      (!filterIcons && !filterApp) ||
      (filterIcons && url.startsWith("/icons")) ||
      (filterApp && url.startsWith("/app"))
    ) {
      const date = new Date().toLocaleString();
      const method = req.method;
      const coloredMethod = method === "GET" ? chalk.green(method) : chalk.red(method);
      const coloredUrl = method === "GET" ? chalk.yellow(url) : chalk.cyan(url);
      console.log(`[${chalk.gray(date)}] ${coloredMethod} ${coloredUrl}`);
    }
    next();
  });
}

app.get("/logout", (req, res) => {
  res.clearCookie("token");
  res.redirect("/login");
});

const authLimiter = rateLimit({
  WINDOW_MS,
  max: 10,
  handler: (req, res) => {
    res.status(429).json({ error: 'Too many requests' });
  }
});

app.post("/api/auth", authLimiter, authRoute);

app.get("/", (req, res) => {
  res.redirect("/app");
});

app.use("/app", authenticate);

app.use(express.static(path.join(process.cwd(), "public"), {
  extensions: ['html', 'htm']
}));

gateway(app);

server.listen(port, () => {
  open(`http://localhost:${port}`);
  console.log(`Server is running on port ${port}`);
});
