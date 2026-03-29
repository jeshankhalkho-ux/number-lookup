import { Router } from "express";
import { nanoid } from "nanoid";
import { botStore } from "./botStore.js";
import { sendMessage } from "./telegram.js";
import { logger } from "./logger.js";

const router = Router();

// GET /api/bot/setup-status
router.get("/bot/setup-status", (req, res) => {
  res.json({ registered: botStore.isAdminRegistered() });
});

// POST /api/bot/request-approval
router.post("/bot/request-approval", async (req, res) => {
  if (!botStore.isAdminRegistered()) {
    return res.status(400).json({ error: "Admin not registered. Please set up the Telegram bot first." });
  }

  const requestId = nanoid(10);
  botStore.createRequest(requestId);

  const adminChatId = botStore.getAdminChatId();
  const time = new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });

  await sendMessage(
    adminChatId,
    `🔐 <b>Login Approval Request</b>\n\n📋 Request ID: <code>${requestId}</code>\n🕐 Time: ${time}\n\nApprove or reject this login request?`,
    {
      inline_keyboard: [
        [
          { text: "✅ Approve", callback_data: `approve:${requestId}` },
          { text: "❌ Reject", callback_data: `reject:${requestId}` },
        ],
      ],
    }
  );

  logger.info({ requestId }, "Approval request sent to admin");
  res.json({ requestId });
});

// GET /api/bot/approval-status/:requestId
router.get("/bot/approval-status/:requestId", (req, res) => {
  const { requestId } = req.params;
  const status = botStore.getStatus(requestId);
  res.json({ status });
});

export default router;
