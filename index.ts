import express from "express";
import { createProxyMiddleware } from "http-proxy-middleware";
import bodyParser from "body-parser";

const app = express();
app.use(bodyParser.json());

const proxyOptions = {
  target: "http://44.212.3.139:8000",
  changeOrigin: true,
  pathRewrite: { "^/api": "/api" },
  onProxyReq: (proxyReq: any, req: any, res: any) => {
    proxyReq.setHeader("Origin", "https://importkey.com");
    proxyReq.setHeader("Host", "api.importkey.com");

    if (req.body && typeof req.body === "object") {
      const bodyData = JSON.stringify(req.body);
      proxyReq.setHeader("Content-Type", "application/json");
      proxyReq.setHeader("Content-Length", Buffer.byteLength(bodyData));
      proxyReq.write(bodyData);
    }
  },
} as unknown as Parameters<typeof createProxyMiddleware>[0]; // 👈 KEY FIX

app.use("/api", createProxyMiddleware(proxyOptions));

app.listen(3000, () => {
  console.log("Proxy server running on port 3000");
});
