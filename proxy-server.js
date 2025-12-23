diff --git a/proxy-server.js b/proxy-server.js
index 891cfe384fd5ad0c45c43fe52e3da1ee7dbd8174..85058718627f49054ff51b4be1d0b4fd196637bc 100644
--- a/proxy-server.js
+++ b/proxy-server.js
@@ -1,38 +1,63 @@
 const express = require("express");
 const https = require("https");
 const axios = require("axios");
 const cors = require("cors");
+const fs = require("fs");
+const path = require("path");
 
 const app = express();
-const API_KEY = "kfbE15PUHWgUZTf2cTLMnZ8EU0f44UCp";
+
+function loadEnvFromFile() {
+    if (process.env.API_KEY) return;
+
+    const envPath = path.join(__dirname, ".env");
+    if (!fs.existsSync(envPath)) return;
+
+    const envContents = fs.readFileSync(envPath, "utf8");
+    envContents.split(/\r?\n/).forEach((line) => {
+        const match = line.match(/^\s*([^#=]+?)\s*=\s*(.*)\s*$/);
+        if (match && !process.env[match[1]]) {
+            process.env[match[1]] = match[2];
+        }
+    });
+}
+
+loadEnvFromFile();
+
+const API_KEY = process.env.API_KEY;
 
 app.use(cors());
 
 app.get("/", async (req, res) => {
     const searchdate = req.query.searchdate || new Date().toISOString().slice(0, 10).replace(/-/g, '');
-    let url = `https://www.koreaexim.go.kr/site/program/financial/exchangeJSON?authkey=${API_KEY}&searchdate=${searchdate}&data=AP01`;
+    if (!API_KEY) {
+        console.error("API_KEY is not configured in environment variables");
+        return res.status(500).json({ error: "API key is not configured." });
+    }
+
+    const url = `https://www.koreaexim.go.kr/site/program/financial/exchangeJSON?authkey=${API_KEY}&searchdate=${searchdate}&data=AP01`;
 
     try {
         const httpsAgent = new https.Agent({ rejectUnauthorized: false });
 
         let response = await axios.get(url, {
             httpsAgent,
             headers: {
                 "User-Agent": "Mozilla/5.0"
             },
             maxRedirects: 0,
             validateStatus: function (status) {
                 return status >= 200 && status < 400; // 3xx 까지도 통과시킴
             }
         });
 
         // 만약 302 리다이렉트면 Location 헤더 따로 처리
         if (response.status === 302 && response.headers.location) {
             let redirectUrl = response.headers.location;
             if (redirectUrl.startsWith('/')) {
                 redirectUrl = `https://www.koreaexim.go.kr${redirectUrl}`;
             }
             console.log(`➡️ 리다이렉트 감지: ${redirectUrl}`);
 
             response = await axios.get(redirectUrl, {
                 httpsAgent,
