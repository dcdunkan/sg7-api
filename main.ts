import { serve } from "https://deno.land/std@0.148.0/http/mod.ts";

serve(async (req) => {
  const path = new URL(req.url).pathname;
  const split = path.split("/");
  if (path === "/" || split.length !== 3) {
    return Response.redirect("https://github.com/dcdunkan/sg7-api");
  }

  const lang = split[1].toLowerCase();
  const song = parseInt(split[2]);
  if (
    // deno-fmt-ignore
    ![
      "m", "e", "h", "k", "t",
      "ml", "en", "hi", "kn", "ta",
      "mal", "eng", "hin", "kan", "tam",
      "malayalam", "english", "hindi", "kannada", "tamil",
    ].includes(lang)
  ) {
    return new Response("Not found", { status: 404 });
  }

  const category = lang[0] === "m"
    ? "mal"
    : lang[0] === "e"
    ? "eng"
    : lang[0] === "h"
    ? "hin"
    : lang[0] === "k"
    ? "kan"
    : lang[0] === "t"
    ? "tam"
    : undefined;

  if (!category) {
    return new Response("Not found", { status: 404 });
  }

  try {
    const json = await (await fetch(
      `https://raw.githubusercontent.com/dcdunkan/sg7-api/main/songs/${category}/${song}.json`,
    )).json();
    return Response.json(json);
  } catch (_e) {
    return new Response("Not found", { status: 404 });
  }
});
