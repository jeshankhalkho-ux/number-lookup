import {
  deleteWebhook,
  getUpdates,
  sendMessage,
  answerCallbackQuery,
  editMessageReplyMarkup,
} from "./telegram.js";
import { botStore } from "./botStore.js";
import { logger } from "./logger.js";

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function startTelegramPolling() {
  await deleteWebhook();
  logger.info("Telegram polling started");

  while (true) {
    try {
      const updates = await getUpdates(botStore.updateOffset);

      if (!updates || !Array.isArray(updates)) {
        await sleep(1000);
        continue;
      }

      for (const update of updates) {
        botStore.updateOffset = update.update_id + 1;

        // Register first message sender as admin
        if (update.message) {
          const chatId = update.message.chat.id;
          const firstName = update.message.chat.first_name || "Admin";

          if (!botStore.isAdminRegistered()) {
            botStore.setAdminChatId(chatId);
            await sendMessage(
              chatId,
              `✅ <b>Hello ${firstName}!</b>\n\nYou are now registered as the admin.\nYou will receive login approval requests here with Approve/Reject buttons.`
            );
            logger.info({ chatId, firstName }, "Admin registered");
          } else {
            await sendMessage(chatId, "ℹ️ You are already registered as admin.");
          }
        }

        // Handle button taps (approve / reject)
        if (update.callback_query) {
          const { id, data, message } = update.callback_query;
          const chatId = message.chat.id;
          const messageId = message.message_id;

          if (data.startsWith("approve:")) {
            const requestId = data.replace("approve:", "");
            botStore.approve(requestId);
            await answerCallbackQuery(id, "✅ Approved!");
            await editMessageReplyMarkup(chatId, messageId, { inline_keyboard: [] });
            await sendMessage(chatId, `✅ Request <b>${requestId}</b> has been <b>approved</b>.`);
            logger.info({ requestId }, "Request approved");
          } else if (data.startsWith("reject:")) {
            const requestId = data.replace("reject:", "");
            botStore.reject(requestId);
            await answerCallbackQuery(id, "❌ Rejected!");
            await editMessageReplyMarkup(chatId, messageId, { inline_keyboard: [] });
            await sendMessage(chatId, `❌ Request <b>${requestId}</b> has been <b>rejected</b>.`);
            logger.info({ requestId }, "Request rejected");
          }
        }
      }
    } catch (err) {
      logger.error({ err }, "Polling error");
    }

    await sleep(1000);
  }
}
