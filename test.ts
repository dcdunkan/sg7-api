import { serve } from "https://deno.land/std@0.148.0/http/mod.ts";

serve(async () => {
  console.log(Deno.env.get("DENO_DIR"));
  console.log(Deno.cwd());
  console.log(await Deno.readFile("./songs/eng/1.json"));
  return new Response();
});
