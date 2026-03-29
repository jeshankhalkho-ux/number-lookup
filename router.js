import { Router } from "express";
import { nanoid } from "nanoid";
import { botStore } from "./botStore.js";
import { sendMessage } from "./telegram.js";
import { logger } from "./logger.js";

const router = Router();

router.get("/bot/setup-status", (req, res) => {
  res.json({ registered: botStore.isAdminRegistered() });
});

router.post("/bot/request-approval", async (req, res) => {
  if (!botStore.isAdminRegistered()) {
    return res.status(400).json({ error: "Admin not registered." });
  }
  const requestId = nanoid(10);
  botStore.createRequest(requestId);
  const adminChatId = botStore.getAdminChatId();
  const time = new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });
  await sendMessage(adminChatId,
    🔐 <b>Login Approval Request</b>\n\n📋 Request ID: <code>${requestId}</code>\n🕐 Time: ${time}\n\nApprove or reject?,
    { inline_keyboard: [[
      { text: "✅ Approve", callback_data: approve:${requestId} },
      { text: "❌ Reject",  callback_data: reject:${requestId}  },
    ]]}
  );
  res.json({ requestId });
});

router.get("/bot/approval-status/:requestId", (req, res) => {
  res.json({ status: botStore.getStatus(req.params.requestId) });
});

router.get("/lookup", async (req, res) => {
  const { number } = req.query;
  if (!number) return res.status(400).json({ error: "Number required" });
  try {
    const url = https://numberimfo.vishalboss.sbs/api.php?number=${number}&key=vishal_434b2cfd059a;
    const data = await fetch(url).then(r => r.json());
    res.json(data);
  } catch(err) {
    res.status(500).json({ error: "Lookup failed" });
  }
});

export default router;
