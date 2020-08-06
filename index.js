const Telegraf = require("telegraf");

const bot = new Telegraf(process.env.BOT_TOKEN);
bot.start(ctx => ctx.reply("Привет!"));
bot.help(ctx => ctx.reply("Send me a sticker"));
bot.hears("hi", ctx => ctx.reply("Hey there"));
bot.launch({
  webhook: {
    domain: "https://tfs-telegrem-bot.herokuapp.com/",
    port: process.env.PORT
  }
});
