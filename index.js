const Telegraf = require("telegraf");

const bot = new Telegraf(process.env.BOT_TOKEN);
bot.start(ctx => ctx.reply("Привет!"));

bot.launch({
  webhook: {
    domain: "https://tfs-telegrem-bot.herokuapp.com/",
    port: process.env.PORT
  }
});
bot.start(ctx => {
  console.log("default chats to notify:", chatsToNotify);

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
  "https://tfs-observer-telegram-bot.herokuapp.com/telegraf/07e4f521f4a38e9e50e08b3f8525efe23fc556fa9b6cb75ad2b987a612fce3e9"
);

expressApp.get("/", (req, res) => res.send("Hello World!"));
expressApp.use(
  bot.webhookCallback(
    "/telegraf/07e4f521f4a38e9e50e08b3f8525efe23fc556fa9b6cb75ad2b987a612fce3e9"
  )
);

expressApp.listen(PORT, () => {
  console.log(`app listening on port ${PORT}!`);
});