import { serve } from "https://deno.land/std@0.148.0/http/mod.ts";
import {
  Bot,
  InlineKeyboard,
  webhookCallback,
} from "https://deno.land/x/grammy@v1.9.2/mod.ts";
const bot = new Bot(Deno.env.get("BOT_TOKEN")!);
bot.catch(console.error);

bot.command("start", async (ctx) => {
  if (!ctx.match) {
    return await ctx.reply(
"Use an available language command followed by the song number, and I can get you \
the lyrics of the songs. \n\
You can use me like this: \n\
/mal <song-number>\n\
Example: /mal 1\n\
Available language commands: /mal /eng /hin /kan /tam",
    );
  }

  const split = ctx.match.split("_");
  const res = await fetch(
    `https://sg7.deno.dev/${split[0]}/${split[1]}.json`,
  );
  if (!res.ok) return await ctx.reply("Couldn't find the requested song data");

  const data = await res.json();
  return await ctx.reply(
    `<b>${data.number}</b>${data.old_number ? ` (${data.old_number})` : ""}
\n${sanitize(data.text)}\n
Source: https://sg7.deno.dev/${split[0]}/${split[1]}.json
Share: https://t.me/${ctx.me.username}?start=${split[0]}_${split[1]}`,
    { parse_mode: "HTML", disable_web_page_preview: true },
  );
});

// deno-fmt-ignore
const cmd = [
  "ml",  "en",  "hi",  "kn",  "ta",
  "mal", "eng", "hin", "kan", "tam"
];

// const count = {
//   mal: 1260,
//   eng: 221,
//   hin: 48,
//   kan: 15,
//   tam: 15,
// };

bot.command(cmd, async (ctx) => {
  if (!ctx.match) {
    return await ctx.reply("Enter a song number with the command");
  }
  const cmd = ctx.msg.entities[0];
  const category = getLang(ctx.msg.text.substring(1, cmd.length));

  const res = await fetch(
    `https://sg7.deno.dev/${category}/${ctx.match}.json`,
  );
  if (!res.ok) return await ctx.reply("Couldn't find the requested song data");

  const data = await res.json();
  return await ctx.reply(
    `<b>${data.number}</b>${data.old_number ? ` (${data.old_number})` : ""}
\n${sanitize(data.text)}\n
Source: https://sg7.deno.dev/${category}/${ctx.match}.json
Share: https://t.me/${ctx.me.username}?start=${category}_${ctx.match}`,
    { parse_mode: "HTML", disable_web_page_preview: true },
  );
});

bot.inlineQuery(/(mal|ml|eng|en|hin|hi|kan|kn|tam|ta)( \d+|)/, async (ctx) => {
  const queryParams = ctx.inlineQuery.query.split(" ");
  const lang = queryParams[0];
  const number = queryParams[1];
  const res = await fetch(`https://sg7.deno.dev/${lang}/${number}.json`);
  if (!res.ok) {
    return await ctx.answerInlineQuery([
      {
        type: "article",
        id: "1234",
        title:
          "Enter a valid song number. Couldn't find the requested song data.",
        input_message_content: { message_text: "Oops :(" },
      },
    ]);
  }
  const s = await res.json();
  const share = `https://t.me/${ctx.me.username}?start=${
    getLang(lang)
  }_${s.number}`;
  await ctx.answerInlineQuery([
    {
      type: "article",
      id: `${lang}_${number}`,
      title: `${number}${s.old_number ? ` (${s.old_number})` : ""} — ${s.text}`,
      input_message_content: {
        message_text: `<b>${s.number}</b>${
          s.old_number ? ` (${s.old_number})` : ""
        }
\n${sanitize(s.text)}\n
Source: https://sg7.deno.dev/${getLang(lang)}/${s.number}.json
Share: ${share}`,
        parse_mode: "HTML",
        disable_web_page_preview: true,
      },
      reply_markup: new InlineKeyboard().url("Open", `${share}`),
    },
  ]);
});

bot.on("inline_query", async (ctx) => {
  await ctx.answerInlineQuery([
    {
      type: "article",
      id: "1234",
      title: "Invalid query, enter a language abbr followed by song number.",
      input_message_content: { message_text: "Oops :(" },
    },
  ]);
});

// bot.start();

const handleUpdate = webhookCallback(bot, "std/http");
await bot.init();

serve(async (req) => {
  if (req.method === "POST") {
    try {
      return await handleUpdate(req);
    } catch (err) {
      console.error(err);
      return new Response();
    }
  }
  // redirect any other requests to the bot profile
  return Response.redirect(`https://telegram.me/${bot.botInfo.username}`);
});

/** https://github.com/grammyjs/storages/blob/main/packages/README.md#grammy-storages https://github.com/grammyjs/storages/tree/main/packages#grammy-storages */
function sanitize(str: string) {
  return str
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/&/g, "&amp;");
}

function getLang(lang: string) {
  return lang[0] === "m"
    ? "mal"
    : lang[0] === "e"
    ? "eng"
    : lang[0] === "h"
    ? "hin"
    : lang[0] === "k"
    ? "kan"
    : "tam";
}

// function getFullLang(lang: string) {
//   return lang[0] === "m"
//     ? "Malayalam"
//     : lang[0] === "e"
//     ? "English"
//     : lang[0] === "h"
//     ? "Hindi"
//     : lang[0] === "k"
//     ? "Kannada"
//     : "Tamil";
// }
