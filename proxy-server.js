const express = require("express");
const https = require("https");
const axios = require("axios");
const cors = require("cors");

const app = express();
const API_KEY = "kfbE15PUHWgUZTf2cTLMnZ8EU0f44UCp";

app.use(cors());

app.get("/", async (req, res) => {
    const searchdate = req.query.searchdate || new Date().toISOString().slice(0, 10).replace(/-/g, '');
    let url = `https://www.koreaexim.go.kr/site/program/financial/exchangeJSON?authkey=${API_KEY}&searchdate=${searchdate}&data=AP01`;

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
        console.error("Proxy Error:", error.message || error);
        res.status(500).json({ error: "환율 데이터를 가져올 수 없습니다." });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`✅ Proxy server is running on port ${PORT}`);
});
