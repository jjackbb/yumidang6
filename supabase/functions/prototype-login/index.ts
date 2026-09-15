import { createClient } from "npm:@supabase/supabase-js@2.116.0";

// Public prototype credentials. Only these three synthetic identities are allowed.
// This never verifies a real phone or grants identity-verification badges.
const accounts = ["01000000001", "01000000002", "01000000003"];
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
    const raw = await req.text();
    if (raw.length > 1024) throw new Error("잘못된 로그인 요청입니다.");
    const { phone, code } = JSON.parse(raw);
    const index = accounts.indexOf(phone);
    if (index < 0 || code !== "123456")
      return Response.json(
        { error: "안내된 테스트 번호와 인증번호 123456을 입력해 주세요." },
        { status: 401, headers },
      );
    const url = Deno.env.get("SUPABASE_URL")!;
    const secret = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const admin = createClient(url, secret, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const email = `prototype-${index + 1}@yumidang.invalid`;
    const key = await crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(secret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"],
    );
    const bytes = new Uint8Array(
      await crypto.subtle.sign(
        "HMAC",
        key,
        new TextEncoder().encode("yumidang-test-v1:" + email),
      ),
    );
    const password = Array.from(bytes, (byte) =>
      byte.toString(16).padStart(2, "0"),
    ).join("");
    const login = createClient(url, Deno.env.get("SUPABASE_ANON_KEY")!, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const created = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      app_metadata: { prototype_account: true },
      user_metadata: { prototype_label: `테스트 ${index + 1}` },
    });
    if (
      created.error &&
      !["email_exists", "user_already_exists"].includes(
        created.error.code || "",
      )
    ) {
      // GoTrue can return the generic 422 for an already registered address.
      if (created.error.status !== 422) throw created.error;
    }
    const { data, error } = await login.auth.signInWithPassword({
      email,
      password,
    });
    if (error || !data.session || !data.user?.app_metadata?.prototype_account)
      throw error || new Error("테스트 계정을 확인할 수 없어요.");
    const id = data.user.id;
    const profile = await admin
      .from("profiles")
      .upsert(
        {
          id,
          display_name: `테스트 ${index + 1}`,
          bio: "DB 연결을 확인하는 공용 테스트 계정입니다.",
          neighborhood: "성동구 성수동",
          age_group: "20대",
          hobbies: ["산책", "전시"],
          traits: ["차분한"],
          avatar_url: "/logo.jpg",
        },
        { onConflict: "id", ignoreDuplicates: true },
      );
    if (profile.error) throw profile.error;
    const privateProfile = await admin
      .from("private_profiles")
      .upsert(
        {
          user_id: id,
          gender: "undisclosed",
          terms_version: "prototype",
          terms_accepted_at: new Date().toISOString(),
        },
        { onConflict: "user_id", ignoreDuplicates: true },
      );
    if (privateProfile.error) throw privateProfile.error;
    return Response.json(
      {
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
      },
      { headers },
    );
  } catch {
    return Response.json(
      { error: "테스트 로그인에 실패했어요. 잠시 후 다시 시도해 주세요." },
      { status: 400, headers },
    );
  }
});
