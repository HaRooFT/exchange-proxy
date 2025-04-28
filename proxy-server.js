const express = require("express");
const https = require("https");
const axios = require("axios");
const cors = require("cors");

const app = express();
const API_KEY = "kfbE15PUHWgUZTf2cTLMnZ8EU0f44UCp";

app.use(cors());

app.get("/", async (req, res) => {
    const searchdate = req.query.searchdate || new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const url = `https://www.koreaexim.go.kr/site/program/financial/exchangeJSON?authkey=${API_KEY}&searchdate=${searchdate}&data=AP01`;

    try {
        const httpsAgent = new https.Agent({ rejectUnauthorized: false });

        const response = await axios.get(url, {
            httpsAgent,
            headers: {
                "User-Agent": "Mozilla/5.0"
            }
        });

        res.json(response.data);
    } catch (error) {
        console.error("Proxy Error:", error);
        res.status(500).json({ error: "환율 데이터를 가져올 수 없습니다." });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Proxy server is running on port ${PORT}`);
});
