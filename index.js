const { Telegraf } = require("telegraf");
const Telegram = require("telegraf/telegram");
const express = require("express");

const { BOT_TOKEN, DEFAULT_CHAT_IDS, PORT } = process.env;
let chatsToNotify = DEFAULT_CHAT_IDS ? [...DEFAULT_CHAT_IDS.split(",")] : [];
const telegram = new Telegram(BOT_TOKEN);

const bot = new Telegraf(BOT_TOKEN, {
  // Telegram options
  agent: null, // https.Agent instance, allows custom proxy, certificate, keep alive, etc.
  webhookReply: false // Reply via webhook
});
const expressApp = express();

bot.start(ctx => {
  ctx.reply(
    "Используйте команду /subscribe, чтобы подписаться на уведомление об изменениях"
  );
});

bot.command("/subscribe", ctx => {
  console.log("ctx", ctx);
  const { id: chatId } = ctx.chat || {};

  console.log("new chatId:", chatId);

  if (!chatsToNotify.includes(chatId)) {
    chatsToNotify.push(chatId);
  }
  ctx.reply("Вы успешно подписались");
});

bot.on("text", async function(ctx) {
  const { publisherId, message: { text, html } = {}, resource: { url } = {} } =
    ctx.update || {};
  if (publisherId !== "tfs") {
    return;
  }

  console.log("ctx", ctx);
  console.log("ctx.update", ctx.update);

  try {
    chatsToNotify.forEach(async chatId => {
      await telegram.sendMessage(chatId, `HTML:${html}`, {
        parse_mode: "HTML"
      });
    });
  } catch (e) {
    console.error("error", e);
  }
});

bot.telegram.setWebhook(
  "https://tfs-observer-telegram-bot.herokuapp.com/telegraf/7a2548463a4cafdb30128c2d72de871026a25c2ed0b491496a1366f071e96322"
);

expressApp.get("/", (req, res) => res.send("Hello World!"));
expressApp.use(
  bot.webhookCallback(
    "/telegraf/7a2548463a4cafdb30128c2d72de871026a25c2ed0b491496a1366f071e96322"
  )
);

expressApp.listen(PORT, () => {
  console.log(`app listening on port ${PORT}!`);
});
