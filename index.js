const { Telegraf } = require("telegraf");
const express = require("express");

const { BOT_TOKEN, PORT, DEFAULT_CHAT_IDS } = process.env;
let chatsToNotify = DEFAULT_CHAT_IDS ? [...DEFAULT_CHAT_IDS.split(",")] : [];
const expressApp = express();

const bot = new Telegraf(BOT_TOKEN, {
  // Telegram options
  agent: null, // https.Agent instance, allows custom proxy, certificate, keep alive, etc.
  webhookReply: false // Reply via webhook
});

bot.start(ctx => {
  console.log("ctx", ctx);
  ctx.reply(
    "Используйте команду /subscribe, чтобы подписаться на уведомление об изменениях"
  );
});

bot.command("/subscribe", ctx => {
  const { id: chatId } = ctx.chat || {};

  console.log("new chatId:", chatId);

  if (!chatsToNotify.includes(chatId)) {
    chatsToNotify.push(chatId);
    ctx.reply("Вы успешно подписались");
  } else ctx.reply("Вы уже подписаны");
});



bot.on("text", async function(ctx) {
  const { publisherId, message: { text, html } = {}, resource: { url } = {} } =
    ctx.update || {};
  if (publisherId !== "tfs") {
    return;
  }

  console.log("ctx.update", ctx.update);

  try {
    chatsToNotify.forEach(async chatId => {
      await bot.telegram.sendMessage(chatId, `HTML:${html}`, {
        parse_mode: "HTML"
      });
    });
  } catch (e) {
    console.error("error", e);
  }
});


/*bot.startWebhook(
  "/telegraf/7a2548463a4cafdb30128c2d72de871026a25c2ed0b491496a1366f071e96322",
  null,
  PORT
);*/

expressApp.get("/", (req, res) => res.send("Hello World!"));
expressApp.use(
  bot.webhookCallback(
    "/telegraf/7a2548463a4cafdb30128c2d72de871026a25c2ed0b491496a1366f071e96322"
  )
);
bot.telegram.setWebhook(
  "https://tfs-telegram-bot.herokuapp.com/telegraf/7a2548463a4cafdb30128c2d72de871026a25c2ed0b491496a1366f071e96322"
);

expressApp.listen(PORT, () => {
  console.log(`app listening on port ${PORT}!`);
});

//bot.launch();
