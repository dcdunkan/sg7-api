import { serve } from "https://deno.land/std@0.148.0/http/mod.ts";

serve((req) => {
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
  
  let json: string;
  try {
    json = Deno.readTextFileSync(`songs/${category}/${song}.json`);
  } catch (_e) {
    return new Response("Not found", { status: 404 });
  }

  return Response.json(JSON.parse(json), { status: 200 });
});
