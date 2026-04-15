router.get("/lookup", async (req, res) => {
  const { number } = req.query;
  if (!number) return res.status(400).json({ error: "Number required" });
  try {
    const url = "https://numberimfo.vishalboss.sbs/api.php?number=" + number + "&key=vishal_434b2cfd059a";
    const data = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0",
        "Accept": "application/json"
      }
    }).then(r => r.json());
    res.json(data);
  } catch(err) {
    logger.error({ err }, "Lookup failed");
    res.status(500).json({ error: "Lookup failed" });
  }
});
