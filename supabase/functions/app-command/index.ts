import { createClient } from "npm:@supabase/supabase-js@2.116.0";

// Gateway JWT verification is disabled for modern signing keys. Every request is
// authenticated here via Auth.getUser before the service-role RPC is reachable.
Deno.serve(async (req: Request) => {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers":
      "authorization, x-client-info, apikey, content-type",
    "Cache-Control": "no-store",
  };
  if (req.method === "OPTIONS") return new Response("ok", { headers });
  if (req.method !== "POST")
    return Response.json({ error: "POST required" }, { status: 405, headers });
  try {
    const token = req.headers.get("authorization")?.replace(/^Bearer /i, "");
    if (!token)
      return Response.json(
        { error: "로그인이 필요해요." },
        { status: 401, headers },
      );
    const client = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { auth: { persistSession: false, autoRefreshToken: false } },
    );
    const {
      data: { user },
      error,
    } = await client.auth.getUser(token);
    if (error || !user || user.is_anonymous)
      return Response.json(
        { error: "로그인을 다시 확인해 주세요." },
        { status: 401, headers },
      );
    const raw = await req.text();
    if (raw.length > 400_000)
      return Response.json(
        { error: "입력한 데이터가 너무 커요." },
        { status: 413, headers },
      );
    const body = JSON.parse(raw);
    const result = await client.rpc("app_command", {
      p_actor: user.id,
      p_action: body.action,
      p_data: body.data || {},
    });
    if (result.error)
      return Response.json(
        {
          error:
            result.error.code === "P0001"
              ? result.error.message
              : "저장할 수 없어요. 입력값과 현재 상태를 확인해 주세요.",
        },
        { status: 400, headers },
      );
    return Response.json({ result: result.data }, { headers });
  } catch {
    return Response.json(
      { error: "요청을 처리하지 못했어요. 다시 시도해 주세요." },
      { status: 400, headers },
    );
  }
});
