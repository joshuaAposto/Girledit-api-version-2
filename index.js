const fs = require("fs");
const express = require("express");
const axios = require("axios");
const path = require("path");
const app = express();
const port = 3000;

const GIRL_VIDS_PATH = path.join(__dirname, "girledit/GirlVids/girl.json");
const CREDITS = ["joshua apostol"];
const GOD_ARRAY = ["61554201747411"];
const STATIC_DIR = path.join(__dirname, "girledit");

app.use(express.json());
app.use(express.static(STATIC_DIR));

app.get("/", (req, res) => {
  res.sendFile(path.join(STATIC_DIR, "video.html"));
});

app.get("/docs", (req, res) => {
  res.sendFile(path.join(STATIC_DIR, "docs/docs.html"));
});

app.get("/api/add", (req, res) => {
  res.sendFile(path.join(STATIC_DIR, "add.html"));
});

app.get("/api/link", (req, res) => {
  res.sendFile(GIRL_VIDS_PATH);
});

app.post("/api/request/f", async (req, res) => {
  const { credits } = req.body;

  if (!CREDITS.includes(credits)) {
    return res.status(400).json({ error: "Invalid credits." });
  }

  try {
    const fileContent = fs.readFileSync(GIRL_VIDS_PATH, "utf-8");
    const links = JSON.parse(fileContent);
    const randomLink = links.girl[Math.floor(Math.random() * links.girl.length)];

    const response = await axios.get(`https://www.tikwm.com/api/?url=${randomLink}`);
    const { play: video, author, title = "No title" } = response.data.data;
    const { unique_id: username, nickname } = author;

    res.json({
      url: video,
      username,
      nickname,
      title,
      totalvids: links.girl.length,
    });
  } catch (error) {
    console.error("Error fetching TikTok data:", error);
    res.status(500).json({ error: "Error fetching data from TikTok API." });
  }
});

app.post("/api/add/girl", async (req, res) => {
  const { uid, link } = req.body;

  if (!GOD_ARRAY.includes(uid)) {
    return res.status(403).json({ message: "Unauthorized access." });
  }

  if (!link.startsWith("https://www.tiktok.com/") && !link.startsWith("https://vt.tiktok.com/")) {
    return res.status(400).json({ message: "Invalid TikTok link." });
  }

  try {
    if (!fs.existsSync(GIRL_VIDS_PATH)) {
      fs.writeFileSync(GIRL_VIDS_PATH, JSON.stringify({ girl: [] }, null, 4));
    }

    const data = JSON.parse(fs.readFileSync(GIRL_VIDS_PATH));
    data.girl.push(link);
    fs.writeFileSync(GIRL_VIDS_PATH, JSON.stringify(data, null, 4));

    res.json({ message: `Successfully added link: ${link}` });
  } catch (error) {
    console.error("Error adding TikTok link:", error);
    res.status(500).send("Internal Server Error");
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
