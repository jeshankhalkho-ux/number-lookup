const BOT_TOKEN = process.env["TELEGRAM_BOT_TOKEN"] || "7984776800:AAFDnWHwCgXdZdnpbE55Xv-2Zzqu9a8ycBE";
const BASE = `https://api.telegram.org/bot${BOT_TOKEN}`;

async function call(method, body) {
  const res = await fetch(`${BASE}/${method}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const json = await res.json();
  return json.result;
}

export async function deleteWebhook() {
  return call("deleteWebhook", {});
}

export async function getUpdates(offset) {
  return call("getUpdates", { offset, timeout: 10 });
}

export async function sendMessage(chatId, text, replyMarkup) {
  return call("sendMessage", {
    chat_id: chatId,
    text,
    parse_mode: "HTML",
    reply_markup: replyMarkup,
  });
}

export async function answerCallbackQuery(id, text) {
  return call("answerCallbackQuery", {
    callback_query_id: id,
    text,
  });
}

export async function editMessageReplyMarkup(chatId, messageId, replyMarkup) {
  return call("editMessageReplyMarkup", {
    chat_id: chatId,
    message_id: messageId,
    reply_markup: replyMarkup,
  });
}
