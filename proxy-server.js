const express = require("express");
const https = require("https");
const axios = require("axios");
const cors = require("cors");

const app = express();
const API_KEY = "kfbE15PUHWgUZTf2cTLMnZ8EU0f44UCp";

app.use(cors());

app.get("/", async (req, res) => {
    const searchdate = req.query.searchdate || new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const apiUrl = `https://www.koreaexim.go.kr/site/program/financial/exchangeJSON?authkey=${API_KEY}&searchdate=${searchdate}&data=AP01`;

    try {
        const httpsAgent = new https.Agent({ rejectUnauthorized: false });

        const response = await axios.get(apiUrl, {
            httpsAgent,
            timeout: 5000,
            maxRedirects: 5,
            validateStatus: (status) => status >= 200 && status < 400,
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/115.0",
                "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
                "Accept-Language": "en-US,en;q=0.5",
                "Connection": "keep-alive",
                "Upgrade-Insecure-Requests": "1"
            }
        });

        res.json(response.data);
    } catch (error) {
        console.error("Proxy Error:", error.message || error);
        res.status(500).json({ error: "환율 데이터를 가져올 수 없습니다." });
    }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
    console.log(`✅ Proxy server is running on port ${PORT}`);
});
