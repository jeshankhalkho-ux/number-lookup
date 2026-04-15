const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

const API_KEY = "Jishan15";
const sessionStore = new Map();

const fetch = (...args) => import("node-fetch").then(({default: fetch}) => fetch(...args));

app.get("/api/verify", (req, res) => {
  const key = req.query.key;
  if (key === API_KEY) {
    const token = Math.random().toString(36).substring(2);
    sessionStore.set(token, Date.now());
    res.json({ success: true, token });
  } else {
    res.json({ success: false });
  }
});

app.get("/api/lookup", async (req, res) => {
  const { number, token } = req.query;
  
  if (!token || !sessionStore.has(token)) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  
  const session = sessionStore.get(token);
  if (Date.now() - session > 3600000) {
    sessionStore.delete(token);
    return res.status(401).json({ error: "Session expired" });
  }
  
  if (!number) {
    return res.status(400).json({ error: "Number required" });
  }
  
  try {
    const url = `https://numberimfo.vishalboss.sbs/api.php?number=${number}&key=vishal_434b2cfd059a`;
    const data = await fetch(url).then(r => r.json());
    res.json(data);
  } catch (err) {
    console.error("Lookup failed:", err);
    res.status(500).json({ error: "Lookup failed" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
