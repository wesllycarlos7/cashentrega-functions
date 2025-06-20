import { serve } from "https://deno.land/std/http/server.ts";

serve(async () => {
  return new Response("Função de bônus OK!", {
    headers: { "Content-Type": "text/plain" },
  });
});
