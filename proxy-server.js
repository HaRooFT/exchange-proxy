require("dotenv").config();
const express = require("express");
const https = require("https");
const axios = require("axios");
const cors = require("cors");

const app = express();
const API_KEY = process.env.API_KEY;

app.use(cors());

app.get("/", async (req, res) => {
    const searchdate = req.query.searchdate || new Date().toISOString().slice(0, 10).replace(/-/g, '');
    if (!API_KEY) {
        console.error("API_KEY is not configured in environment variables");
        return res.status(500).json({ error: "API key is not configured." });
    }

    const url = `https://www.koreaexim.go.kr/site/program/financial/exchangeJSON?authkey=${API_KEY}&searchdate=${searchdate}&data=AP01`;

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
                headers: {
                    "User-Agent": "Mozilla/5.0"
                }
            });
        }

        res.json(response.data);
    } catch (error) {
        const status = error.response?.status || 500;
        const message = error.response?.data || error.message || "환율 데이터를 가져올 수 없습니다.";
        console.error("Proxy Error:", { status, message });
        res.status(status).json({ error: message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`✅ Proxy server is running on port ${PORT}`);
});
