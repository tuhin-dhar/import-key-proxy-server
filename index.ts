// proxy-server.ts
import express, { Request, Response } from "express";
import { createProxyMiddleware } from "http-proxy-middleware";
import cors from "cors";
import bodyParser from "body-parser";
import type { ClientRequest } from "http";

const app = express();

// Middleware to parse JSON bodies
app.use(bodyParser.json());

// CORS setup
app.use(
  cors({
    origin: "https://import-key.vercel.app",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Origin",
      "Host",
      "x-forwarded-host",
      "public-code",
      "public-short-code",
    ],
  })
);

// Define the proxy middleware
const proxy = createProxyMiddleware({
  target: "http://44.212.3.139:8000",
  changeOrigin: true,
  pathRewrite: (path: any) => {
    console.log("Rewriting path:", path);
    return `/api${path}`; // prepend /api to everything
  },
  // Use `events` hook — manually typed because v3 lacks declaration
  events: {
    proxyReq: (
      proxyReq: ClientRequest,
      req: Request & { body?: any },
      res: Response
    ) => {
      // Inject custom headers
      proxyReq.setHeader("Origin", "https://importkey.com");
      proxyReq.setHeader("Host", "api.importkey.com");
      proxyReq.setHeader("X-Forwarded-For", "api.importkey.com");
      proxyReq.setHeader("public-code", "public-code");
      proxyReq.setHeader("public-short-code", "public-short-code");

      // Forward JSON body manually
      if (req.body && typeof req.body === "object") {
        const bodyData = JSON.stringify(req.body);
        proxyReq.setHeader("Content-Type", "application/json");
        proxyReq.setHeader("Content-Length", Buffer.byteLength(bodyData));
        proxyReq.write(bodyData);
      }
    },
  },
} as any); // cast required due to lack of `events` type in v3

// Attach to route
app.use("/api", proxy);

// Start server
app.listen(3000, () => {
  console.log("🔁 Proxy server listening on http://localhost:3000");
});
