import { Router } from "express";
import { nanoid } from "nanoid";
import { botStore } from "../lib/botStore.js";
import { sendMessage } from "../lib/telegram.js";
import { logger } from "../lib/logger.js";

const router = Router();

// GET /api/bot/setup-status
// Returns whether an admin has registered via Telegram
router.get("/bot/setup-status", (req, res) => {
  res.json({ registered: botStore.isAdminRegistered() });
});

// POST /api/bot/request-approval
// Sends a login approval request to the admin's Telegram
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
// Polls for the current status of a request
router.get("/bot/approval-status/:requestId", (req, res) => {
  const { requestId } = req.params;
  const status = botStore.getStatus(requestId);
  res.json({ status });
});

export default router;
