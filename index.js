const { Router } = require("express");
const { nanoid } = require("nanoid");
const { botStore } = require("./botStore.js");
const { sendMessage } = require("./telegram.js");
const { logger } = require("./logger.js");
import app from "./app.js";
import { logger } from "./logger.js";
import { startTelegramPolling } from "./telegramPoller.js";

const port = Number(process.env["PORT"]) || 3000;

app.listen(port, (err) => {
  if (err) {
    logger.error({ err }, "Failed to start server");
    process.exit(1);
  }
  logger.info({ port }, "Server listening");
  startTelegramPolling();
});
