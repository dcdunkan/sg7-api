import { serve } from "https://deno.land/std@0.148.0/http/mod.ts";
import { Bot, webhookCallback } from "https://deno.land/x/grammy@v1.9.2/mod.ts";
const bot = new Bot(Deno.env.get("BOT_TOKEN")!);

// deno-fmt-ignore
const cmd = [
  "ml",  "en",  "hi",  "kn",  "ta",
  "mal", "eng", "hin", "kan", "tam"
];

bot.command(cmd, async (ctx) => {
  if (!ctx.match) {
    return await ctx.reply("Enter a song number with the command");
  }
  const cmd = ctx.msg.entities[0];
  const lang = ctx.msg.text.substring(1, cmd.length);
  const category = lang[0] === "m"
    ? "mal"
    : lang[0] === "e"
    ? "eng"
    : lang[0] === "h"
    ? "hin"
    : lang[0] === "k"
    ? "kan"
    : "tam";

  const res = await fetch(
    `https://sg7.deno.dev/${category}/${ctx.match}.json`,
  );
  if (!res.ok) return await ctx.reply("Not found");

  const data: { text: string; number: number; old_number?: number } = await res
    .json();
  return await ctx.reply(
    `${data.number}${
      data.old_number ? ` (${data.old_number})` : ""
    }\n\n${data.text}`,
  );
});

// bot.start();

const handleUpdate = webhookCallback(bot, "std/http");
await bot.init();

serve(async (req) => {
  if (req.method == "POST") {
    try {
      return await handleUpdate(req);
    } catch (err) {
      console.error(err);
      return new Response();
    }
  }

  // redirect any other requests to the bot
  return Response.redirect(`https://telegram.me/${bot.botInfo.username}`);
});
1